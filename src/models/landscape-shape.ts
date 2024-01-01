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

export interface ShapeDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function getShapeDimensions(placedLandscapeShape: PlacedLandscapeShape): ShapeDimensions {
  const { baseShape, position, heroPosition } = placedLandscapeShape;

  if (heroPosition) {
    // only the hero itself counts as filled cell
    return {
      width: 1,
      height: 1,
      x: position.x + heroPosition.x,
      y: position.y + heroPosition.y,
    };
  }

  return {
    width: baseShape.width,
    height: baseShape.height,
    x: position.x,
    y: position.y,
  };
}
