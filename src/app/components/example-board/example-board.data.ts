import { BoardTile } from '../../../models/board-tile';
import { LandscapeType } from '../../../models/landscape-type';
import { MonsterType } from '../../../models/monster';

export const exampleBoard: BoardTile[][] = [
  [
    {
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      position: {
        x: 0,
        y: 1,
      },
    },
    {
      position: {
        x: 0,
        y: 2,
      },
    },
    {
      position: {
        x: 0,
        y: 3,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 0,
        y: 4,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 0,
        y: 5,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 0,
        y: 6,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 0,
        y: 7,
      },
    },
    {
      position: {
        x: 0,
        y: 8,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 0,
        y: 9,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 0,
        y: 10,
      },
      landscape: LandscapeType.FOREST,
    },
  ],
  [
    {
      position: {
        x: 1,
        y: 0,
      },
    },
    {
      position: {
        x: 1,
        y: 1,
      },
      landscape: LandscapeType.MOUNTAIN,
      hasCoin: true,
    },
    {
      position: {
        x: 1,
        y: 2,
      },
    },
    {
      position: {
        x: 1,
        y: 3,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 1,
        y: 4,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 1,
        y: 5,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 1,
        y: 6,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 1,
        y: 7,
      },
    },
    {
      position: {
        x: 1,
        y: 8,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 1,
        y: 9,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 1,
        y: 10,
      },
      landscape: LandscapeType.FOREST,
    },
  ],
  [
    {
      position: {
        x: 2,
        y: 0,
      },
    },
    {
      position: {
        x: 2,
        y: 1,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 2,
        y: 2,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 2,
        y: 3,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 2,
        y: 4,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 2,
        y: 5,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 2,
        y: 6,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 2,
        y: 7,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 2,
        y: 8,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 2,
        y: 9,
      },
    },
    {
      position: {
        x: 2,
        y: 10,
      },
      landscape: LandscapeType.FIELD,
    },
  ],
  [
    {
      position: {
        x: 3,
        y: 0,
      },
    },
    {
      position: {
        x: 3,
        y: 1,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 3,
        y: 2,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 3,
        y: 3,
      },
    },
    {
      position: {
        x: 3,
        y: 4,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 3,
        y: 5,
      },
      landscape: LandscapeType.MOUNTAIN,
      hasCoin: true,
    },
    {
      position: {
        x: 3,
        y: 6,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 3,
        y: 7,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 3,
        y: 8,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 3,
        y: 9,
      },
    },
    {
      position: {
        x: 3,
        y: 10,
      },
      landscape: LandscapeType.FIELD,
    },
  ],
  [
    {
      position: {
        x: 4,
        y: 0,
      },
    },
    {
      position: {
        x: 4,
        y: 1,
      },
    },
    {
      position: {
        x: 4,
        y: 2,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 4,
        y: 3,
      },
    },
    {
      position: {
        x: 4,
        y: 4,
      },
    },
    {
      position: {
        x: 4,
        y: 5,
      },
    },
    {
      position: {
        x: 4,
        y: 6,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 4,
        y: 7,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 4,
        y: 8,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 4,
        y: 9,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 4,
        y: 10,
      },
    },
  ],
  [
    {
      position: {
        x: 5,
        y: 0,
      },
    },
    {
      position: {
        x: 5,
        y: 1,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 5,
        y: 2,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 5,
        y: 3,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 5,
        y: 4,
      },
    },
    {
      position: {
        x: 5,
        y: 5,
      },
    },
    {
      position: {
        x: 5,
        y: 6,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 5,
        y: 7,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 5,
        y: 8,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 5,
        y: 9,
      },
      landscape: LandscapeType.MOUNTAIN,
      hasCoin: true,
    },
    {
      position: {
        x: 5,
        y: 10,
      },
    },
  ],
  [
    {
      position: {
        x: 6,
        y: 0,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 6,
        y: 1,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 6,
        y: 2,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 6,
        y: 3,
      },
    },
    {
      position: {
        x: 6,
        y: 4,
      },
    },
    {
      position: {
        x: 6,
        y: 5,
      },
    },
    {
      position: {
        x: 6,
        y: 6,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 6,
        y: 7,
      },
    },
    {
      position: {
        x: 6,
        y: 8,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 6,
        y: 9,
      },
      monsterType: MonsterType.DRAGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 6,
        y: 10,
      },
      monsterType: MonsterType.DRAGON,
      landscape: LandscapeType.MONSTER,
    },
  ],
  [
    {
      position: {
        x: 7,
        y: 0,
      },
    },
    {
      position: {
        x: 7,
        y: 1,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 7,
        y: 2,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 7,
        y: 3,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 7,
        y: 4,
      },
    },
    {
      position: {
        x: 7,
        y: 5,
      },
      monsterType: MonsterType.ZOMBIE,
      landscape: LandscapeType.MONSTER,
      heroStar: true,
      destroyed: true,
    },
    {
      position: {
        x: 7,
        y: 6,
      },
      monsterType: MonsterType.ZOMBIE,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 7,
        y: 7,
      },
      monsterType: MonsterType.ZOMBIE,
      landscape: LandscapeType.MONSTER,
      heroStar: true,
      destroyed: true,
    },
    {
      position: {
        x: 7,
        y: 8,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 7,
        y: 9,
      },
      monsterType: MonsterType.DRAGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 7,
        y: 10,
      },
    },
  ],
  [
    {
      position: {
        x: 8,
        y: 0,
      },
      landscape: LandscapeType.FIELD,
    },
    {
      position: {
        x: 8,
        y: 1,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 8,
        y: 2,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 8,
        y: 3,
      },
      landscape: LandscapeType.MOUNTAIN,
      hasCoin: false,
    },
    {
      position: {
        x: 8,
        y: 4,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 8,
        y: 5,
      },
      landscape: LandscapeType.VILLAGE,
    },
    {
      position: {
        x: 8,
        y: 6,
      },
      landscape: LandscapeType.HERO,
      destroyed: true,
    },
    {
      position: {
        x: 8,
        y: 7,
      },
      monsterType: MonsterType.GORGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 8,
        y: 8,
      },
      monsterType: MonsterType.DRAGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 8,
        y: 9,
      },
      monsterType: MonsterType.DRAGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 8,
        y: 10,
      },
      landscape: LandscapeType.WATER,
    },
  ],
  [
    {
      position: {
        x: 9,
        y: 0,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 9,
        y: 1,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 9,
        y: 2,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 9,
        y: 3,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 9,
        y: 4,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 9,
        y: 5,
      },
      heroStar: true,
    },
    {
      position: {
        x: 9,
        y: 6,
      },
      monsterType: MonsterType.GORGON,
      landscape: LandscapeType.MONSTER,
      heroStar: true,
      destroyed: true,
    },
    {
      position: {
        x: 9,
        y: 7,
      },
      heroStar: true,
    },
    {
      position: {
        x: 9,
        y: 8,
      },
      landscape: LandscapeType.MOUNTAIN,
      hasCoin: true,
    },
    {
      position: {
        x: 9,
        y: 9,
      },
      landscape: LandscapeType.WATER,
    },
    {
      position: {
        x: 9,
        y: 10,
      },
    },
  ],
  [
    {
      position: {
        x: 10,
        y: 0,
      },
    },
    {
      position: {
        x: 10,
        y: 1,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 10,
        y: 2,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 10,
        y: 3,
      },
    },
    {
      position: {
        x: 10,
        y: 4,
      },
      landscape: LandscapeType.FOREST,
    },
    {
      position: {
        x: 10,
        y: 5,
      },
    },
    {
      position: {
        x: 10,
        y: 6,
      },
      heroStar: true,
    },
    {
      position: {
        x: 10,
        y: 7,
      },
      monsterType: MonsterType.GORGON,
      landscape: LandscapeType.MONSTER,
    },
    {
      position: {
        x: 10,
        y: 8,
      },
      landscape: LandscapeType.HERO,
    },
    {
      position: {
        x: 10,
        y: 9,
      },
    },
    {
      position: {
        x: 10,
        y: 10,
      },
    },
  ],
];
