export enum LandscapeType {
  HERO = 'hero',
  MONSTER = 'monster',
  MOUNTAIN = 'mountain',
  FOREST = 'forest',
  WATER = 'water',
  FIELD = 'field',
  VILLAGE = 'village',
}

export enum ShapeBitMap {
  T_BIG = 0b111010010,
  T_SMALL = 0b111010000,
  L_BIG = 0b111100000,
  L_SMALL = 0b110100000,
  X_BIG = 0b010111010,
  Z_BIG = 0b110010011,
  O_SMALL = 0b110110000,
  HERO_1 = 0b101010101,
}

export function coordinateContainsBit(shapeBitMap: ShapeBitMap, coordinate: Coordinates): boolean {
  return (shapeBitMap & (1 << (coordinate.x + coordinate.y * SHAPE_SIZE))) !== 0;
}

export const SHAPE_SIZE = 3;

export interface Coordinates {
  x: number;
  y: number;
}

export interface LandscapeShape {
  type: LandscapeType;
  shapeBitMap: ShapeBitMap;
  heroPosition?: Coordinates;
}

export interface PlacedLandscapeShape extends LandscapeShape {
  rotation?: number;
  mirror?: boolean;
  position: Coordinates;
}
