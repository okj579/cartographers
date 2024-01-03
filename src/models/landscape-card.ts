import { LandscapeType } from './landscape-type';
import { BaseShape, ShapeName, SHAPES } from './base-shape';

export interface LandscapeCard {
  name: string;
  timeValue: 0 | 1 | 2;
  landscapeTypes: LandscapeType[];
  baseShapes: BaseShape[];
}

export const LANDSCAPE_CARDS: LandscapeCard[] = [
  {
    name: 'Portal',
    timeValue: 0,
    landscapeTypes: [LandscapeType.FOREST, LandscapeType.VILLAGE, LandscapeType.FIELD, LandscapeType.WATER /* LandscapeType.MONSTER*/], // todo
    baseShapes: [SHAPES[ShapeName.DOT]],
  },
  {
    name: 'Ranch',
    timeValue: 1,
    landscapeTypes: [LandscapeType.FIELD],
    baseShapes: [SHAPES[ShapeName.TWO_DOTS], SHAPES[ShapeName.S]],
  },
  {
    name: 'Pool',
    timeValue: 1,
    landscapeTypes: [LandscapeType.WATER],
    baseShapes: [SHAPES[ShapeName.SLASH], SHAPES[ShapeName.T_SMALL]],
  },
  {
    name: 'Grove',
    timeValue: 1,
    landscapeTypes: [LandscapeType.FOREST],
    baseShapes: [SHAPES[ShapeName.L_SMALL], SHAPES[ShapeName.I_TWICE]],
  },
  {
    name: 'Village',
    timeValue: 1,
    landscapeTypes: [LandscapeType.VILLAGE],
    baseShapes: [SHAPES[ShapeName.I_SMALL], SHAPES[ShapeName.W]],
  },
  {
    name: 'Crossroads',
    timeValue: 2,
    landscapeTypes: [LandscapeType.FOREST, LandscapeType.VILLAGE],
    baseShapes: [SHAPES[ShapeName.PLUS]],
  },
  {
    name: 'Coastal Village',
    timeValue: 2,
    landscapeTypes: [LandscapeType.VILLAGE, LandscapeType.WATER],
    baseShapes: [SHAPES[ShapeName.L_BIG]],
  },
  {
    name: 'Enchanted Garden',
    timeValue: 2,
    landscapeTypes: [LandscapeType.FOREST, LandscapeType.FIELD],
    baseShapes: [SHAPES[ShapeName.J]],
  },
  {
    name: 'Border Post',
    timeValue: 2,
    landscapeTypes: [LandscapeType.VILLAGE, LandscapeType.FIELD],
    baseShapes: [SHAPES[ShapeName.T_BIG]],
  },
  {
    name: 'Mangrove',
    timeValue: 2,
    landscapeTypes: [LandscapeType.FOREST, LandscapeType.WATER],
    baseShapes: [SHAPES[ShapeName.U]],
  },
  {
    name: 'Travertine',
    timeValue: 2,
    landscapeTypes: [LandscapeType.FIELD, LandscapeType.WATER],
    baseShapes: [SHAPES[ShapeName.O_SMALL]],
  },
];
