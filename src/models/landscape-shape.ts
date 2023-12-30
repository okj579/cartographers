import { LandscapeType } from './landscape-type';
import { Coordinates } from './simple-types';
import { BaseShape } from './base-shape';

export interface LandscapeShape {
  type: LandscapeType;
  baseShape: BaseShape;
  heroPosition?: Coordinates;
}

export interface PlacedLandscapeShape extends LandscapeShape {
  position: Coordinates;
}
