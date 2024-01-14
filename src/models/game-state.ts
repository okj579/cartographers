import { BoardTile } from './board-tile';
import { Season, SeasonScore } from './season';
import { LandscapeCard } from './landscape-card';
import { Goal } from './goals';

export interface GameState {
  readonly goals: Goal[];
  readonly seasonSetups: SeasonSetup[];
  readonly playerStates: PlayerGameState[];
}

export interface SeasonSetup {
  readonly season: Season;
  readonly cardDeck: LandscapeCard[];
}

export interface PlayerGameState {
  readonly player: Player;
  readonly boardState: BoardTile[][];
  readonly coins: number;
  readonly currentCardIndex: number;
  readonly currentSeasonIndex: number;
  readonly seasonScores: SeasonScore[];
  readonly playedMonsterCards: LandscapeCard[];
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
  readonly playedCards: LandscapeCard[];
  readonly cardToPlace: LandscapeCard | undefined;
  readonly playerStates: CurrentPlayerGameState[];
}

export interface CurrentPlayerGameState extends PlayerGameState {
  readonly scores: number[];
}

export interface TempPlayerGameState extends CurrentPlayerGameState {
  readonly hasConflict: boolean;
  readonly conflictedCellIndices: number[];
}
