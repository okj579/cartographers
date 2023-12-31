import { LandscapeType } from './landscape-type';
import { Coordinates } from './simple-types';
import { MonsterType } from './monster';

export interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  conflicted?: boolean;
  isOutOfBounds?: boolean;
  heroStar?: boolean;
  isBase?: boolean;
  isTemporary?: boolean;
  hasCoin?: boolean;
  monsterType?: MonsterType;
}

export function tilesToCoordinates(tiles: BoardTile[]): Coordinates[] {
  return tiles.map((tile) => tile.position);
}
