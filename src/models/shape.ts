export enum LandscapeType {
  HERO = 'hero',
  MONSTER = 'monster',
  MOUNTAIN = 'mountain',
  FOREST = 'forest',
  WATER = 'water',
  FIELD = 'field',
  VILLAGE = 'village',
}

enum ShapeBitMap {
  T_BIG = 0b111010010,
  T_SMALL = 0b111010000,
  L_BIG = 0b111100000,
  L_SMALL = 0b110100000,
  X_BIG = 0b010111010,
  Z_BIG = 0b110010011,
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface LandscapeShape {
  type: LandscapeType;
  shapeBitMap: ShapeBitMap;
  heroPosition?: Coordinates;
}

export interface PlacedShape extends LandscapeShape {
  rotation: number;
  mirror: boolean;
  position: Coordinates;
}
