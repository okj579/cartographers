import { BaseShape } from '../models/base-shape';
import { Coordinates } from '../models/simple-types';
import { LandscapeShape } from '../models/landscape-shape';

export function rotateShapeClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.height - cell.y - 1, y: cell.x }));

  return { width: shape.height, height: shape.width, filledCells };
}

function rotateShapeCounterClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: cell.y, y: shape.width - cell.x - 1 }));

  return { width: shape.height, height: shape.width, filledCells };
}

export function mirrorShape(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.width - cell.x - 1, y: cell.y }));

  return { ...shape, filledCells };
}

export function rotateLandscapeShapeClockwise(shape: LandscapeShape): LandscapeShape {
  const baseShape = rotateShapeClockwise(shape.baseShape);
  const heroPosition = shape.heroPosition
    ? {
        x: baseShape.width - shape.heroPosition.y - 1,
        y: shape.heroPosition.x,
      }
    : undefined;

  return { ...shape, baseShape, heroPosition };
}

export function rotateLandscapeShapeCounterClockwise(shape: LandscapeShape): LandscapeShape {
  const baseShape = rotateShapeCounterClockwise(shape.baseShape);
  const heroPosition = shape.heroPosition
    ? {
        x: shape.heroPosition.y,
        y: baseShape.height - shape.heroPosition.x - 1,
      }
    : undefined;

  return { ...shape, baseShape, heroPosition };
}

export function mirrorLandscapeShape(shape: LandscapeShape): LandscapeShape {
  const baseShape = mirrorShape(shape.baseShape);
  const heroPosition = shape.heroPosition
    ? {
        x: baseShape.width - shape.heroPosition.x - 1,
        y: shape.heroPosition.y,
      }
    : undefined;

  return { ...shape, baseShape, heroPosition };
}
