import { LandscapeType, PlacedLandscapeShape, ShapeBitMap } from '../models/shape';

export const MOCK_PLACED_SHAPES: PlacedLandscapeShape[] = [
  {
    position: { x: 4, y: 4 },
    type: LandscapeType.FOREST,
    shapeBitMap: ShapeBitMap.X_BIG,
  },
  {
    position: { x: 1, y: 0 },
    type: LandscapeType.FIELD,
    shapeBitMap: ShapeBitMap.O_SMALL,
  },
  {
    position: { x: 0, y: 6 },
    type: LandscapeType.WATER,
    shapeBitMap: ShapeBitMap.T_SMALL,
  },
  {
    position: { x: 6, y: 0 },
    type: LandscapeType.MONSTER,
    shapeBitMap: ShapeBitMap.Z_BIG,
  },
  {
    position: { x: 6, y: 6 },
    type: LandscapeType.VILLAGE,
    shapeBitMap: ShapeBitMap.T_BIG,
  },
  {
    position: { x: 5, y: 0 },
    type: LandscapeType.HERO,
    shapeBitMap: ShapeBitMap.HERO_1,
    heroPosition: { x: 1, y: 1 },
  },
];

export const MOCK_DESTROYED_TILES = [
  { position: { x: 7, y: 0 }, destroyed: true },
  { position: { x: 7, y: 2 }, destroyed: true },
];
