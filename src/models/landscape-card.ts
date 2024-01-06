import { LandscapeType } from './landscape-type';
import { BaseShape, copyShape, ShapeName, SHAPES } from './base-shape';
import { Monster, MONSTER_MAP, MonsterType } from './monster';

export interface LandscapeCard {
  name: string;
  timeValue: 0 | 1 | 2;
  landscapeTypes: LandscapeType[];
  baseShapes: BaseShape[];
  monster?: Monster;
  heroPosition?: { x: number; y: number };
}

export function copyLandscapeCard(card: LandscapeCard): LandscapeCard {
  return {
    name: card.name,
    timeValue: card.timeValue,
    landscapeTypes: [...card.landscapeTypes],
    baseShapes: card.baseShapes.map((shape) => copyShape(shape)),
    monster: card.monster ? { ...card.monster } : undefined,
    heroPosition: card.heroPosition ? { ...card.heroPosition } : undefined,
  };
}

export function getPortalCard(type?: LandscapeType): LandscapeCard {
  if (type === LandscapeType.MONSTER) {
    return {
      ...LANDSCAPE_CARDS[0],
      landscapeTypes: [LandscapeType.MONSTER],
    };
  }

  return LANDSCAPE_CARDS[0];
}

export const MONSTER_CARDS: LandscapeCard[] = [
  {
    name: 'Dragon',
    timeValue: 0,
    landscapeTypes: [LandscapeType.MONSTER],
    baseShapes: [SHAPES[ShapeName.Z_BIG]],
    monster: MONSTER_MAP[MonsterType.DRAGON],
  },
  {
    name: 'Troll',
    timeValue: 0,
    landscapeTypes: [LandscapeType.MONSTER],
    baseShapes: [SHAPES[ShapeName.T_SMALL]],
    monster: MONSTER_MAP[MonsterType.TROLL],
  },
  {
    name: 'Zombie',
    timeValue: 0,
    landscapeTypes: [LandscapeType.MONSTER],
    baseShapes: [SHAPES[ShapeName.DOT]],
    monster: MONSTER_MAP[MonsterType.ZOMBIE],
  },
  {
    name: 'Gorgon',
    timeValue: 0,
    landscapeTypes: [LandscapeType.MONSTER],
    baseShapes: [SHAPES[ShapeName.V]],
    monster: MONSTER_MAP[MonsterType.GORGON],
  },
];

export const HERO_CARDS: LandscapeCard[] = [
  {
    name: 'Dwarf Fighter',
    timeValue: 0,
    landscapeTypes: [LandscapeType.HERO],
    baseShapes: [SHAPES[ShapeName.PLUS]],
    heroPosition: { x: 1, y: 1 },
  },
  {
    name: 'Elf Archer',
    timeValue: 0,
    landscapeTypes: [LandscapeType.HERO],
    baseShapes: [SHAPES[ShapeName.I_BIG]],
    heroPosition: { x: 0, y: 0 },
  },
  {
    name: 'Halfling Wizard',
    timeValue: 0,
    landscapeTypes: [LandscapeType.HERO],
    baseShapes: [SHAPES[ShapeName.X]],
    heroPosition: { x: 1, y: 1 },
  },
  {
    name: 'Human Knight',
    timeValue: 0,
    landscapeTypes: [LandscapeType.HERO],
    baseShapes: [SHAPES[ShapeName.T_BIG_GAP]],
    heroPosition: { x: 1, y: 2 },
  },
];

export const LANDSCAPE_CARDS: LandscapeCard[] = [
  {
    name: 'Portal',
    timeValue: 0,
    landscapeTypes: [LandscapeType.FOREST, LandscapeType.VILLAGE, LandscapeType.FIELD, LandscapeType.WATER, LandscapeType.MONSTER],
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
