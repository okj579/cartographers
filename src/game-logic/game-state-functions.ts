import {
  CurrentGameState,
  CurrentPlayerBoard,
  CurrentPlayerGameState,
  GameState,
  PlayerGameState,
  SeasonSetup,
  TempPlayerGameState,
} from '../models/game-state';
import { findGoalByName, getFallbackScoreInfo, getMonsterScore, getShuffledGoals, Goal, GoalCategory, ScoreInfo } from '../models/goals';
import { getInitialBoardTiles } from './constants';
import { getPortalCard, HERO_CARDS, LANDSCAPE_CARDS, LandscapeCard, MONSTER_CARDS } from '../models/landscape-card';
import { getCurrentTimeProgress, getSeasonScore, getShuffledCards, tryPlaceShapeOnBoard } from './functions';
import { Season, SEASONS, SeasonScore } from '../models/season';
import { LandscapeType } from '../models/landscape-type';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { applyMonsterEffect, getSeasonEndMonsterEffect } from './monster-effects';
import { getCurrentUserId, getUserName } from '../app/data/util';
import { BoardTile } from '../models/board-tile';
import { AnyMove, isRegularMove, isSeasonChange, Move, SpecialMove } from '../models/move';
import { flipLandscapeShape, rotateLandscapeShapeClockwise, rotateLandscapeShapeCounterClockwise } from './transformation-functions';

export function createNewGame(): GameState {
  return {
    goals: getShuffledGoals(),
    seasonSetups: createSeasonSetups(),
    playerStates: [createPlayerState()],
  };
}

export function addPlayer(state: GameState): GameState {
  return {
    ...state,
    playerStates: [...state.playerStates, createPlayerState(true)],
  };
}

export function stateToCurrentState(state: GameState, playerId: string): CurrentGameState {
  const playerIndex = findPlayerIndex(state.playerStates, playerId);
  const activePlayerState = state.playerStates[playerIndex];
  const lengthOfMoveHistory = activePlayerState?.moveHistory.length ?? 0;
  const playerStates: CurrentPlayerGameState[] = state.playerStates.map((playerState) => ({
    ...playerStateToCurrentPlayerState(playerState, state, lengthOfMoveHistory),
  }));

  return {
    playerStates,
  };
}

function getMovesOfCurrentSeason(moves: AnyMove[]): Move[] {
  const seasonChangeMoves = moves.filter(isSeasonChange);
  const lastSeasonChangeMove = seasonChangeMoves[seasonChangeMoves.length - 1];
  const lastSeasonChangeMoveIndex = moves.indexOf(lastSeasonChangeMove);

  return moves.slice(lastSeasonChangeMoveIndex + 1).filter(isRegularMove);
}

function playerStateToCurrentPlayerState(
  playerState: PlayerGameState,
  state: GameState,
  numberOfMoves: number = 9999,
): CurrentPlayerGameState {
  const board = getBoardStateFromMoveHistory(playerState, getAllPlayedCards(state), numberOfMoves, state.goals);

  const moves = playerState.moveHistory.slice(0, numberOfMoves);
  const seasonChangeMoves = moves.filter(isSeasonChange);
  const seasonMoves = getMovesOfCurrentSeason(moves);
  const currentSeasonIndex = seasonChangeMoves.length;
  const currentCardIndex = seasonMoves.length;
  const season: Season | undefined = SEASONS[currentSeasonIndex];
  const seasonGoals = state.goals.filter((_goal, index) => season?.goalIndices.includes(index));
  const isStartOfSeason = currentCardIndex === 0 && !!season;
  const cardDeck = state.seasonSetups[currentSeasonIndex]?.cardDeck ?? [];
  const previouslyPlayedCards = cardDeck.slice(0, currentCardIndex);
  const isEndOfSeason = getCurrentTimeProgress(previouslyPlayedCards) >= season?.duration || currentCardIndex >= cardDeck.length;
  const playedSeasonCards = isEndOfSeason ? previouslyPlayedCards : cardDeck.slice(0, currentCardIndex + 1);
  const allPlayedCards = [...state.seasonSetups.slice(0, currentSeasonIndex).flatMap((setup) => setup.cardDeck), ...playedSeasonCards];
  const cardToPlace = isEndOfSeason ? undefined : cardDeck[currentCardIndex];
  const scoreInfos = getScoresFromBoard(state.goals, board.boardState);
  const scores = scoreInfos.map((scoreInfo) => scoreInfo.score);

  return {
    ...board,
    season,
    seasonGoals,
    isStartOfSeason,
    isEndOfSeason,
    playedSeasonCards,
    allPlayedCards,
    cardToPlace,
    scoreInfos,
    scores,
  };
}

function getAllPlayedCards(state: GameState): LandscapeCard[] {
  return state.seasonSetups.flatMap((setup) => setup.cardDeck);
}

function getScoresFromBoard(goals: Goal[], board: BoardTile[][]): ScoreInfo[] {
  return [
    ...goals.map((goal) => {
      const localGoal = findGoalByName(goal.name);

      if (!localGoal) return getFallbackScoreInfo(GoalCategory.GLOBAL);

      return localGoal.scoreAlgorithm(board);
    }),
    getMonsterScore(board),
  ];
}

function getBoardStateFromMoveHistory(
  playerState: PlayerGameState,
  allPlayedCards: LandscapeCard[],
  numberOfMoves: number,
  goals: Goal[],
): CurrentPlayerBoard {
  let board: CurrentPlayerBoard = {
    ...playerState,
    boardState: getInitialBoardTiles(),
    coins: 0,
    seasonScores: [],
  };
  let seasonIndex = 0;
  const moves = playerState.moveHistory.slice(0, numberOfMoves);
  const remainingCards = [...allPlayedCards];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    if (isRegularMove(move)) {
      const card = remainingCards.shift();
      if (!card) {
        console.error('No card left to place. Should not happen!');
        return board;
      }
      board = applyMoveToBoard(board, card, move);
    } else {
      if (isSeasonChange(move)) {
        const scores = getScoresFromBoard(goals, board.boardState).map((scoreInfo) => scoreInfo.score);
        const currentSeason = SEASONS[seasonIndex];
        seasonIndex++;
        board = {
          ...board,
          seasonScores: [...board.seasonScores, getSeasonScoreFromCurrentBoard(board, scores, currentSeason)],
        };
      } else {
        board = { ...board, boardState: applyMonsterEffect(board.boardState, move) };
      }
    }
  }

  return board;
}

export function addMoveToGame(state: GameState, move: AnyMove, playerId: string): GameState {
  const playerState = state.playerStates.find((playerState) => playerState.player.id === playerId);
  if (!playerState) return state;

  return updatePlayerState(state, { ...playerState, moveHistory: [...playerState.moveHistory, move] });
}

export function applyMoveToBoard(board: CurrentPlayerBoard, card: LandscapeCard, move: Move): CurrentPlayerBoard {
  const placedLandscapeShape = getPlacedShapeFromMove(move, card);

  const { updatedBoard, newCoins } = tryPlaceShapeOnBoard(board.boardState, placedLandscapeShape);

  return { ...board, boardState: updatedBoard, coins: board.coins + newCoins };
}

export function getPlacedShapeFromMove(move: Move, card: LandscapeCard): PlacedLandscapeShape {
  return {
    ...getLandscapeFromMove(move, card),
    position: move.position,
  };
}

export function getLandscapeFromMove(move: Move, card: LandscapeCard): LandscapeShape {
  let landscapeShape: LandscapeShape;

  if (move.selectedShapeIndex >= card.baseShapes.length) {
    const jokerCard = getPortalCard(card.landscapeTypes[0]);
    landscapeShape = {
      baseShape: jokerCard.baseShapes[move.selectedShapeIndex - card.baseShapes.length],
      type: jokerCard.landscapeTypes[move.selectedLandscapeIndex],
    };
  } else {
    landscapeShape = {
      baseShape: card.baseShapes[move.selectedShapeIndex],
      type: card.landscapeTypes[move.selectedLandscapeIndex],
      heroPosition: card.heroPosition,
      monsterType: card.monster?.type,
    };
  }

  return applyMoveTransformationsToLandscapeShape(landscapeShape, move);
}

export function applyMoveTransformationsToLandscapeShape(landscapeShape: LandscapeShape, move: Move): LandscapeShape {
  let updatedLandscapeShape = { ...landscapeShape };

  for (let i = 0; i < move.numberOfClockwiseRotations; i++) {
    updatedLandscapeShape = rotateLandscapeShapeClockwise(updatedLandscapeShape);
  }
  for (let i = 0; i < move.numberOfCounterClockwiseRotations; i++) {
    updatedLandscapeShape = rotateLandscapeShapeCounterClockwise(updatedLandscapeShape);
  }
  if (move.isFlipped) updatedLandscapeShape = flipLandscapeShape(updatedLandscapeShape);

  return { ...updatedLandscapeShape };
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

export function getTempPlayerStateWithShape(
  state: GameState,
  previousPlayerState: CurrentPlayerGameState,
  shape: PlacedLandscapeShape,
): TempPlayerGameState {
  let { updatedBoard, newCoins, conflictedCellIndices } = tryPlaceShapeOnBoard(previousPlayerState.boardState, shape);
  const hasConflict = conflictedCellIndices.length > 0;
  const coinsFromShape = shape.baseShape.hasCoin ? 1 : 0;
  const newCoinsToAdd = hasConflict ? 0 : newCoins + coinsFromShape;

  const newPlayerState: CurrentPlayerGameState = {
    ...previousPlayerState,
    boardState: updatedBoard,
    coins: previousPlayerState.coins + newCoinsToAdd,
  };

  const scoreInfos: ScoreInfo[] = hasConflict ? previousPlayerState.scoreInfos : getScoresFromBoard(state.goals, updatedBoard);
  const scores: number[] = scoreInfos.map((scoreInfo) => scoreInfo.score);

  return {
    ...(hasConflict ? previousPlayerState : newPlayerState),
    scoreInfos,
    scores,
    hasConflict,
    conflictedCellIndices: conflictedCellIndices,
  };
}

export function endSeason(state: GameState, currentState: CurrentGameState, playerId: string): GameState {
  return {
    ...state,
    playerStates: state.playerStates.map((playerState, index) => {
      if (playerState.player.id !== playerId) return playerState;

      const currentPlayerState = currentState.playerStates[index];

      const playedMonsterCards = [
        ...currentPlayerState.allPlayedCards.filter((card) => card.landscapeTypes.includes(LandscapeType.MONSTER)),
      ];

      const monsterMoves: SpecialMove[] = [];
      playedMonsterCards.forEach((card) => {
        const monsterMove = getSeasonEndMonsterEffect(currentPlayerState.boardState, card.monster?.type);
        if (monsterMove) {
          monsterMoves.push(monsterMove);
        }
      });

      return {
        ...playerState,
        moveHistory: [...playerState.moveHistory, ...monsterMoves, { action: 'change_of_season' }],
      };
    }),
  };
}

function getSeasonScoreFromCurrentBoard(playerState: CurrentPlayerBoard, scores: number[], season: Season): SeasonScore {
  return {
    season,
    goalScores: scores,
    coins: playerState.coins,
    totalScore: getSeasonScore(season, scores, playerState.coins),
  };
}

function createPlayerState(shouldPromptName: boolean = false): PlayerGameState {
  const id = getCurrentUserId();
  const name = getUserName(shouldPromptName);

  return {
    player: { id, name },
    moveHistory: [],
  };
}

function createSeasonSetups(): SeasonSetup[] {
  const seasonSetups: SeasonSetup[] = [];
  const shuffledMonsters = getShuffledCards(MONSTER_CARDS);
  const shuffledHeroes = getShuffledCards(HERO_CARDS);

  for (let i = 0; i < 4; i++) {
    const nextMonster: LandscapeCard = shuffledMonsters[i];
    const nextHero: LandscapeCard = shuffledHeroes[i];
    const remainingHeroesAndMonsters = seasonSetups[i - 1]?.remainingSpecialCards ?? [];
    const cardDeckFull = [...getShuffledCards([...LANDSCAPE_CARDS, nextMonster, nextHero, ...remainingHeroesAndMonsters])];
    const cardDeck = getPlayedCardsOfSeason(cardDeckFull, SEASONS[i]);
    const remainingSpecialCards = cardDeckFull
      .slice(cardDeck.length)
      .filter((card) => [LandscapeType.MONSTER, LandscapeType.HERO].includes(card.landscapeTypes[0]));

    seasonSetups.push({
      season: SEASONS[i],
      cardDeck,
      remainingSpecialCards,
    });
  }

  return seasonSetups;
}

function getPlayedCardsOfSeason(allCards: LandscapeCard[], season: Season): LandscapeCard[] {
  const duration = season.duration;
  const remainingCards: LandscapeCard[] = [...allCards];
  const playedCards: LandscapeCard[] = [];

  while (getCurrentTimeProgress(playedCards) < duration) {
    const card = remainingCards.shift();
    if (!card) break;
    playedCards.push(card);
  }

  return playedCards;
}

export function findPlayerIndex(itemsWithPlayer: { player: { id: string } }[], playerId: string): number {
  return itemsWithPlayer.findIndex((item) => item.player.id === playerId);
}
