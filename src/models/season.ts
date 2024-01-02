export interface Season {
  name: string;
  emoji: string;
  duration: number;
  goalIndices: number[];
}

export const SEASONS: Season[] = [
  {
    name: 'Spring',
    emoji: '🌸',
    duration: 8,
    goalIndices: [0, 1],
  },
  {
    name: 'Summer',
    emoji: '☀️',
    duration: 7,
    goalIndices: [1, 2],
  },
  {
    name: 'Autumn',
    emoji: '🍂',
    duration: 7,
    goalIndices: [2, 3],
  },
  {
    name: 'Winter',
    emoji: '❄️',
    duration: 6,
    goalIndices: [3, 0],
  },
];
