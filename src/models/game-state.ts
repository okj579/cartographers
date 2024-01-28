import { BoardTile } from './board-tile';
import { Season, SeasonScore } from './season';
import { LandscapeCard } from './landscape-card';
import { Goal } from './goals';
import { AnyMove } from './move';

export interface GameState {
  readonly goals: Goal[];
  readonly seasonSetups: SeasonSetup[];
  readonly playerStates: PlayerGameState[];
}

export interface SeasonSetup {
  readonly season: Season;
  readonly cardDeck: LandscapeCard[];
  readonly remainingSpecialCards: LandscapeCard[];
}

export interface PlayerGameState {
  readonly player: Player;
  readonly moveHistory: AnyMove[];
}

export interface Player {
  readonly id: string;
  readonly name: string;
}

export interface CurrentGameState {
  readonly season: Season | undefined;
  readonly seasonGoals: Goal[];
  readonly isStartOfSeason: boolean;
  readonly isEndOfSeason: boolean;
  readonly cardDeck: LandscapeCard[];
  readonly playedSeasonCards: LandscapeCard[];
  readonly allPlayedCards: LandscapeCard[];
  readonly cardToPlace: LandscapeCard | undefined;
  readonly playerStates: CurrentPlayerGameState[];
}

export interface CurrentPlayerBoard extends PlayerGameState {
  readonly boardState: BoardTile[][];
  readonly coins: number;
  readonly seasonScores: SeasonScore[];
}

export interface CurrentPlayerGameState extends CurrentPlayerBoard {
  readonly scores: number[];
}

export interface TempPlayerGameState extends CurrentPlayerGameState {
  readonly hasConflict: boolean;
  readonly conflictedCellIndices: number[];
}
