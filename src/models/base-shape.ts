import { Coordinates } from './simple-types';

export interface BaseShape {
  width: number;
  height: number;
  filledCells: Coordinates[];
  hasCoin?: boolean;
}

export enum ShapeName {
  DOT,
  TWO_DOTS,
  PLUS,
  SLASH,
  I_SMALL,
  I_BIG,
  I_TWICE,
  J,
  L_SMALL,
  L_BIG,
  O_SMALL,
  S,
  T_BIG,
  T_SMALL,
  U,
  V,
  W,
  X,
  Z_BIG,
}

export function copyShape(shape: BaseShape): BaseShape {
  return { ...shape, filledCells: [...shape.filledCells] };
}

export function areShapesEqual(shape1: BaseShape, shape2: BaseShape): boolean {
  if (shape1.width !== shape2.width || shape1.height !== shape2.height) return false;

  return (
    shape1.filledCells.every((cell) => shape2.filledCells.some((c) => c.x === cell.x && c.y === cell.y)) &&
    shape2.filledCells.every((cell) => shape1.filledCells.some((c) => c.x === cell.x && c.y === cell.y))
  );
}

export const SHAPES: Record<ShapeName, BaseShape> = {
  [ShapeName.DOT]: {
    width: 1,
    height: 1,
    filledCells: [{ x: 0, y: 0 }],
  },
  [ShapeName.TWO_DOTS]: {
    width: 3,
    height: 1,
    filledCells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    hasCoin: true,
  },
  [ShapeName.I_BIG]: {
    width: 4,
    height: 1,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
  },
  [ShapeName.I_SMALL]: {
    width: 1,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ],
    hasCoin: true,
  },
  [ShapeName.T_BIG]: {
    width: 3,
    height: 3,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  [ShapeName.T_SMALL]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  [ShapeName.S]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  [ShapeName.L_BIG]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  [ShapeName.W]: {
    width: 3,
    height: 3,
    filledCells: [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  [ShapeName.L_SMALL]: {
    width: 2,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    hasCoin: true,
  },
  [ShapeName.I_TWICE]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  [ShapeName.PLUS]: {
    width: 3,
    height: 3,
    filledCells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  [ShapeName.Z_BIG]: {
    width: 3,
    height: 3,
    filledCells: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
    ],
  },
  [ShapeName.O_SMALL]: {
    width: 2,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  [ShapeName.SLASH]: {
    width: 2,
    height: 2,
    filledCells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    hasCoin: true,
  },
  [ShapeName.V]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  [ShapeName.U]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  [ShapeName.J]: {
    width: 3,
    height: 2,
    filledCells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  [ShapeName.X]: {
    width: 3,
    height: 3,
    filledCells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ],
  },
};
