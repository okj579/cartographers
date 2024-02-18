export interface Season {
  name: string;
  emoji: string;
  duration: number;
  goalIndices: number[];
}

export interface SeasonScore {
  season: Season;
  goalScores: number[];
  totalScore: number;
}

export const SEASONS: Season[] = [
  {
    name: 'Spring',
    emoji: '🌸',
    duration: 8,
    goalIndices: [0, 1, 4, 5],
  },
  {
    name: 'Summer',
    emoji: '☀️',
    duration: 7,
    goalIndices: [1, 2, 4, 5],
  },
  {
    name: 'Autumn',
    emoji: '🍂',
    duration: 7,
    goalIndices: [2, 3, 4, 5],
  },
  {
    name: 'Winter',
    emoji: '❄️',
    duration: 6,
    goalIndices: [3, 0, 4, 5],
  },
];

export function getStillRelevantGoalIndices(season: Season): number[] {
  const seasonIndex = SEASONS.findIndex((s) => s.name === season.name);
  const upcomingSeasons = SEASONS.slice(seasonIndex);

  return upcomingSeasons.reduce((acc, s) => acc.concat(s.goalIndices), [] as number[]);
}
