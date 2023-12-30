import { LandscapeType } from './landscape-type';
import { Coordinates } from './simple-types';

export interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  heroStar?: boolean;
  isBase?: boolean;
}
