export enum MonsterType {
  DRAGON = 'D',
  TROLL = 'T',
  ZOMBIE = 'Z',
  GORGON = 'G',
}

export interface Monster {
  type: MonsterType;
  name: string;
  emoji: string;
}

export const DRAGON_COINS = 3;

const MONSTERS: Monster[] = [
  {
    type: MonsterType.DRAGON,
    name: 'Dragon',
    emoji: '🐉',
  },
  {
    type: MonsterType.TROLL,
    name: 'Troll',
    emoji: '🤡',
  },
  {
    type: MonsterType.ZOMBIE,
    name: 'Zombie',
    emoji: '🧟',
  },
  {
    type: MonsterType.GORGON,
    name: 'Gorgon',
    emoji: '🐍',
  },
];

export const MONSTER_MAP: Record<MonsterType, Monster> = {
  [MonsterType.DRAGON]: MONSTERS[0],
  [MonsterType.TROLL]: MONSTERS[1],
  [MonsterType.ZOMBIE]: MONSTERS[2],
  [MonsterType.GORGON]: MONSTERS[3],
};
