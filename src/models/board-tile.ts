import { LandscapeType } from './landscape-type';
import { Coordinates } from './simple-types';

export interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  conflicted?: boolean;
  heroStar?: boolean;
  isBase?: boolean;
  isTemporary?: boolean;
  hasCoin?: boolean;
}
