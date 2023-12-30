import { ShapeName, SHAPES } from '../models/base-shape';
import { LandscapeType } from '../models/landscape-type';
import { PlacedLandscapeShape } from '../models/landscape-shape';

export const MOCK_PLACED_SHAPES: PlacedLandscapeShape[] = [
  {
    position: { x: 4, y: 4 },
    type: LandscapeType.FOREST,
    baseShape: SHAPES[ShapeName.PLUS],
  },
  {
    position: { x: 2, y: 0 },
    type: LandscapeType.FIELD,
    baseShape: SHAPES[ShapeName.O_SMALL],
  },
  {
    position: { x: 0, y: 6 },
    type: LandscapeType.WATER,
    baseShape: SHAPES[ShapeName.L_BIG],
  },
  {
    position: { x: 5, y: 0 },
    type: LandscapeType.MONSTER,
    baseShape: SHAPES[ShapeName.Z_BIG],
  },
  {
    position: { x: 5, y: 1 },
    type: LandscapeType.HERO,
    baseShape: SHAPES[ShapeName.X],
    heroPosition: { x: 1, y: 1 },
  },
  {
    position: { x: 5, y: 6 },
    type: LandscapeType.VILLAGE,
    baseShape: SHAPES[ShapeName.T_BIG],
  },
];

export const MOCK_DESTROYED_TILES = [
  { position: { x: 6, y: 1 }, destroyed: true },
  { position: { x: 8, y: 1 }, destroyed: true },
];
