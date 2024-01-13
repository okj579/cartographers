import {
  CurrentGameState,
  CurrentPlayerGameState,
  GameState,
  PlayerGameState,
  SeasonSetup,
  TempPlayerGameState,
} from '../models/game-state';
import { getMonsterScore, getShuffledGoals, Goal } from '../models/goals';
import { getInitialBoardTiles } from './constants';
import { HERO_CARDS, LANDSCAPE_CARDS, LandscapeCard, MONSTER_CARDS } from '../models/landscape-card';
import { getCurrentTimeProgress, getSeasonScore, getShuffledCards, tryPlaceShapeOnBoard } from './functions';
import { Season, SEASONS } from '../models/season';
import { LandscapeType } from '../models/landscape-type';
import { PlacedLandscapeShape } from '../models/landscape-shape';

export function createNewGame(): GameState {
  return {
    goals: getShuffledGoals(),
    seasonSetups: createSeasonSetups(),
    playerStates: [createPlayerState()],
  };
}

export function stateToCurrentState(state: GameState, playerIndex: number = 0): CurrentGameState {
  const { seasonSetups, goals } = state;
  const mainPlayerState = state.playerStates[playerIndex];
  const currentSeasonIndex = mainPlayerState.currentSeasonIndex ?? 0;
  const currentCardIndex = mainPlayerState.currentCardIndex ?? -1;
  const season: Season | undefined = SEASONS[currentSeasonIndex];
  const seasonGoals = goals.filter((_goal, index) => season?.goalIndices.includes(index));
  const playerStates: CurrentPlayerGameState[] = state.playerStates.map((playerState) => ({
    ...playerStateToCurrentPlayerState(playerState, state.goals),
  }));
  const isStartOfSeason = currentCardIndex === -1 && !!season;
  const cardDeck = seasonSetups[currentSeasonIndex]?.cardDeck ?? [];
  const playedCards = cardDeck.slice(0, currentCardIndex + 1);
  const isEndOfSeason = getCurrentTimeProgress(playedCards) >= season?.duration ?? false;
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
    scores: [...goals.map((goal) => goal.scoreAlgorithm(playerState.boardState)), getMonsterScore(playerState.boardState)],
  };
}

export function updatePlayerState(state: GameState, newPlayerState: PlayerGameState): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerGameState) =>
      playerGameState.name === newPlayerState.name ? newPlayerState : playerGameState,
    ),
  };
}

export function getTempPlayerStateWithShape(state: GameState, shape: PlacedLandscapeShape): TempPlayerGameState {
  const playerState = state.playerStates[0];
  const { updatedBoard, newCoins, conflictedCellIndices } = tryPlaceShapeOnBoard(playerState.boardState, shape);
  const hasConflict = conflictedCellIndices.length > 0;
  const coinsFromShape = shape.baseShape.hasCoin ? 1 : 0;
  const newCoinsToAdd = hasConflict ? 0 : newCoins + coinsFromShape;

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

export function startSeason(state: GameState): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerState) => ({
      ...playerState,
      currentCardIndex: 0,
    })),
  };
}

export function endSeason(state: GameState, currentState: CurrentGameState): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerState, index) => ({
      ...playerState,
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
    })),
  };
}

function createPlayerState(): PlayerGameState {
  return {
    name: '',
    boardState: getInitialBoardTiles(),
    coins: 0,
    currentCardIndex: -1,
    currentSeasonIndex: 0,
    seasonScores: [],
  };
}

function createSeasonSetups(): SeasonSetup[] {
  const seasonSetups: SeasonSetup[] = [];
  const shuffledMonsters = getShuffledCards(MONSTER_CARDS);
  const shuffledHeroes = getShuffledCards(HERO_CARDS);

  for (let i = 0; i < 4; i++) {
    const cardDeck: LandscapeCard[] = [...LANDSCAPE_CARDS];
    const nextMonster: LandscapeCard = shuffledMonsters[i];
    const nextHero: LandscapeCard = shuffledHeroes[i];
    const remainingHeroesAndMonsters = getRemainingSpecialCardsFromSeason(seasonSetups[i - 1]);

    seasonSetups.push({
      season: SEASONS[i],
      cardDeck: [...getShuffledCards([...cardDeck, nextMonster, nextHero, ...remainingHeroesAndMonsters])],
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
