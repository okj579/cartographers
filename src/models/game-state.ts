import { BoardTile } from './board-tile';
import { Season, SeasonScore } from './season';
import { LandscapeCard } from './landscape-card';
import { Goal } from './goals';

export interface GameState {
  readonly goals: Goal[];
  readonly seasonSetups: SeasonSetup[];
  readonly currentSeasonIndex: number;
  readonly playerStates: PlayerGameState[];
}

export interface SeasonSetup {
  readonly season: Season;
  readonly cardDeck: LandscapeCard[];
}

export interface PlayerGameState {
  readonly name: string;
  readonly boardState: BoardTile[][];
  readonly coins: number;
  readonly currentCardIndex: number;
  readonly seasonScores: SeasonScore[];
}

export interface CurrentGameState {
  readonly season: Season;
  readonly cardDeck: LandscapeCard[];
  readonly seasonGoals: Goal[];
  readonly playerStates: CurrentPlayerGameState[];
}

export interface CurrentPlayerGameState extends PlayerGameState {
  readonly scores: number[];
  readonly cardToPlace?: LandscapeCard;
}

export interface TempPlayerGameState extends CurrentPlayerGameState {
  readonly hasConflict: boolean;
  readonly conflictedCellIndices: number[];
}
