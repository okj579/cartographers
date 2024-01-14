import {
  CurrentGameState,
  CurrentPlayerGameState,
  GameState,
  PlayerGameState,
  SeasonSetup,
  TempPlayerGameState,
} from '../models/game-state';
import { findGoalByName, getMonsterScore, getShuffledGoals, Goal } from '../models/goals';
import { getInitialBoardTiles } from './constants';
import { HERO_CARDS, LANDSCAPE_CARDS, LandscapeCard, MONSTER_CARDS } from '../models/landscape-card';
import { getCurrentTimeProgress, getSeasonScore, getShuffledCards, tryPlaceShapeOnBoard } from './functions';
import { Season, SEASONS } from '../models/season';
import { LandscapeType } from '../models/landscape-type';
import { PlacedLandscapeShape } from '../models/landscape-shape';
import { applyPlacingMonsterEffect, applySeasonEndMonsterEffect } from './monster-effects';
import { getCurrentUserId, getUserName } from '../app/data/util';

export function createNewGame(): GameState {
  return {
    goals: getShuffledGoals(),
    seasonSetups: createSeasonSetups(),
    playerStates: [createPlayerState(true)],
  };
}

export function addPlayer(state: GameState): GameState {
  return {
    ...state,
    playerStates: [...state.playerStates, createPlayerState(true)],
  };
}

export function stateToCurrentState(state: GameState, playerId: string): CurrentGameState {
  const { seasonSetups, goals } = state;
  const playerIndex = findPlayerIndex(state.playerStates, playerId);
  const currentPlayerState = state.playerStates[playerIndex];
  const currentSeasonIndex = currentPlayerState.currentSeasonIndex ?? 0;
  const currentCardIndex = currentPlayerState.currentCardIndex ?? -1;
  const season: Season | undefined = SEASONS[currentSeasonIndex];
  const seasonGoals = goals.filter((_goal, index) => season?.goalIndices.includes(index));
  const playerStates: CurrentPlayerGameState[] = state.playerStates.map((playerState) => ({
    ...playerStateToCurrentPlayerState(playerState, state.goals),
  }));
  const isStartOfSeason = currentCardIndex === -1 && !!season;
  const cardDeck = seasonSetups[currentSeasonIndex]?.cardDeck ?? [];
  const previouslyPlayedCards = isStartOfSeason ? [] : cardDeck.slice(0, currentCardIndex);
  const isEndOfSeason = getCurrentTimeProgress(previouslyPlayedCards) >= season?.duration || currentCardIndex >= cardDeck.length;
  const playedCards = isEndOfSeason ? previouslyPlayedCards : cardDeck.slice(0, currentCardIndex + 1);
  const cardToPlace = isEndOfSeason ? undefined : cardDeck[currentCardIndex];

  return {
    season,
    isStartOfSeason,
    isEndOfSeason,
    cardDeck,
    playedCards,
    cardToPlace,
    seasonGoals,
    playerStates,
  };
}

function playerStateToCurrentPlayerState(playerState: PlayerGameState, goals: Goal[]): CurrentPlayerGameState {
  return {
    ...playerState,
    scores: [
      ...goals.map((goal) => {
        const localGoal = findGoalByName(goal.name);

        if (!localGoal) return 0;

        return localGoal.scoreAlgorithm(playerState.boardState);
      }),
      getMonsterScore(playerState.boardState),
    ],
  };
}

export function updatePlayerState(state: GameState, newPlayerState: PlayerGameState): GameState {
  const playerIndex = findPlayerIndex(state.playerStates, newPlayerState.player.id);
  const playerStates =
    playerIndex === -1
      ? [...state.playerStates, newPlayerState]
      : state.playerStates.map((playerState, index) => {
          if (index !== playerIndex) return playerState;

          return newPlayerState;
        });

  return {
    ...state,
    playerStates,
  };
}

export function getTempPlayerStateWithShape(state: GameState, shape: PlacedLandscapeShape, playerId: string): TempPlayerGameState {
  const playerIndex = findPlayerIndex(state.playerStates, playerId);
  const playerState = state.playerStates[playerIndex];
  let { updatedBoard, newCoins, conflictedCellIndices } = tryPlaceShapeOnBoard(playerState.boardState, shape);
  const hasConflict = conflictedCellIndices.length > 0;
  const coinsFromShape = shape.baseShape.hasCoin ? 1 : 0;
  const newCoinsToAdd = hasConflict ? 0 : newCoins + coinsFromShape;

  if (shape.monsterType) {
    updatedBoard = applyPlacingMonsterEffect(updatedBoard, shape.monsterType);
  }

  const newPlayerState: PlayerGameState = {
    ...playerState,
    boardState: updatedBoard,
    coins: playerState.coins + newCoinsToAdd,
  };

  return {
    ...playerStateToCurrentPlayerState(hasConflict ? playerState : newPlayerState, state.goals),
    hasConflict,
    conflictedCellIndices: conflictedCellIndices,
  };
}

export function startSeason(state: GameState, playerId: string): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerState) => ({
      ...playerState,
      currentCardIndex: playerState.player.id === playerId ? 0 : playerState.currentCardIndex,
    })),
  };
}

export function endSeason(state: GameState, currentState: CurrentGameState, playerId: string): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerState, index) => {
      if (playerState.player.id !== playerId) return playerState;

      const playedMonsterCards = [
        ...playerState.playedMonsterCards,
        ...currentState.playedCards.filter((card) => card.landscapeTypes.includes(LandscapeType.MONSTER)),
      ];

      let boardState = playerState.boardState;
      playedMonsterCards.forEach((card) => {
        boardState = applySeasonEndMonsterEffect(boardState, card.monster?.type);
      });

      return {
        ...playerState,
        boardState,
        currentCardIndex: -1,
        currentSeasonIndex: playerState.currentSeasonIndex + 1,
        seasonScores: [
          ...playerState.seasonScores,
          {
            season: SEASONS[playerState.currentSeasonIndex],
            goalScores: currentState.playerStates[index].scores,
            coins: playerState.coins,
            totalScore: getSeasonScore(SEASONS[playerState.currentSeasonIndex], currentState.playerStates[index].scores, playerState.coins),
          },
        ],
        playedMonsterCards,
      };
    }),
  };
}

function createPlayerState(alwaysPromptName: boolean = false): PlayerGameState {
  const id = getCurrentUserId();
  const name = getUserName(alwaysPromptName);

  return {
    player: { id, name },
    boardState: getInitialBoardTiles(),
    coins: 0,
    currentCardIndex: -1,
    currentSeasonIndex: 0,
    seasonScores: [],
    playedMonsterCards: [],
  };
}

function createSeasonSetups(): SeasonSetup[] {
  const seasonSetups: SeasonSetup[] = [];
  const shuffledMonsters = getShuffledCards(MONSTER_CARDS);
  const shuffledHeroes = getShuffledCards(HERO_CARDS);

  for (let i = 0; i < 4; i++) {
    const nextMonster: LandscapeCard = shuffledMonsters[i];
    const nextHero: LandscapeCard = shuffledHeroes[i];
    const remainingHeroesAndMonsters = getRemainingSpecialCardsFromSeason(seasonSetups[i - 1]);

    seasonSetups.push({
      season: SEASONS[i],
      cardDeck: [...getShuffledCards([...LANDSCAPE_CARDS, nextMonster, nextHero, ...remainingHeroesAndMonsters])],
    });
  }

  return seasonSetups;
}

function getRemainingSpecialCardsFromSeason(seasonSetup: SeasonSetup | undefined): LandscapeCard[] {
  if (!seasonSetup) return [];

  const duration = seasonSetup.season.duration;
  const remainingCards: LandscapeCard[] = [...seasonSetup.cardDeck];
  const playedCards: LandscapeCard[] = [];

  while (getCurrentTimeProgress(playedCards) < duration) {
    const card = remainingCards.shift();
    if (!card) break;
    playedCards.push(card);
  }

  return remainingCards.filter((card) => [LandscapeType.MONSTER, LandscapeType.HERO].includes(card.landscapeTypes[0]));
}

export function findPlayerIndex(itemsWithPlayer: { player: { id: string } }[], playerId: string): number {
  return itemsWithPlayer.findIndex((item) => item.player.id === playerId);
}
