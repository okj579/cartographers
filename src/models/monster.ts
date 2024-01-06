export enum MonsterType {
  DRAGON = 'D',
  TROLL = 'T',
  ZOMBIE = 'Z',
  GORGON = 'G',
}

export interface Monster {
  type: MonsterType;
  name: string;
  description: string;
  emoji: string;
}

const MONSTERS: Monster[] = [
  {
    type: MonsterType.DRAGON,
    name: 'Dragon',
    description: 'Get 3 coins when the dragon is defeated (no malus anymore).',
    emoji: '🐉',
  },
  {
    type: MonsterType.TROLL,
    name: 'Troll',
    description: 'Destroys 1 adjacent empty landscape tile after each scoring.',
    emoji: '🤡',
  },
  {
    type: MonsterType.ZOMBIE,
    name: 'Zombie',
    description: 'Expands to each adjacent empty landscape tile after each scoring.',
    emoji: '🧟',
  },
  {
    type: MonsterType.GORGON,
    name: 'Gorgon',
    description: 'Destroys 1 adjacent landscape tile when placed (except mountain).',
    emoji: '🐍',
  },
];

export const MONSTER_MAP: Record<MonsterType, Monster> = {
  [MonsterType.DRAGON]: MONSTERS[0],
  [MonsterType.TROLL]: MONSTERS[1],
  [MonsterType.ZOMBIE]: MONSTERS[2],
  [MonsterType.GORGON]: MONSTERS[3],
};
