import { LandscapeType } from './landscape-type';
import { Coordinates } from './simple-types';
import { MonsterType } from './monster';

export interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  conflicted?: boolean;
  heroStar?: boolean;
  hasCoin?: boolean;
  monsterType?: MonsterType;
}

export function tilesToCoordinates(tiles: BoardTile[]): Coordinates[] {
  return tiles.map((tile) => tile.position);
}

export function copyBoard(board: BoardTile[][]): BoardTile[][] {
  return board.map((row) => row.map((tile) => ({ ...tile })));
}
