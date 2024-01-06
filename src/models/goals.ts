import { BoardTile } from './board-tile';
import { LandscapeType } from './landscape-type';
import { BOARD_SIZE } from '../game-logic/constants';
import { getIndividualAreas, isTileFilled, isTileOfLandscape } from '../game-logic/functions';
import { Coordinates } from './simple-types';

export enum GoalCategory {
  FOREST = 'forest',
  VILLAGE = 'village',
  FIELD_WATER = 'field-water',
  GLOBAL = 'global',
}

export interface Goal {
  name: string;
  description: string;
  category: string;
  singlePlayerValue: number;
  scoreAlgorithm: (boardState: BoardTile[][]) => number;
}

export const FOREST_GOALS: Goal[] = [
  {
    name: 'Sleepy Forest',
    description: '4 points for each row with at least 3 forest tiles',
    category: GoalCategory.FOREST,
    singlePlayerValue: 24,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let y = 0; y < BOARD_SIZE; y++) {
        let forestTiles = 0;
        for (let x = 0; x < BOARD_SIZE; x++) {
          if (isTileOfLandscape(boardState[x][y], LandscapeType.FOREST)) {
            forestTiles++;
          }
        }
        if (forestTiles >= 3) {
          score += 4;
        }
      }

      return score;
    },
  },
];

export const VILLAGE_GOALS: Goal[] = [
  {
    name: 'Caravan',
    description: '1 point for each column and row of 1 of the village landscape areas',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 16,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const scorePerVillageArea = villageAreas.map((area) => {
        const areaWidth =
          Math.max(...area.tiles.map((tile) => tile.position.x)) - Math.min(...area.tiles.map((tile) => tile.position.x)) + 1;
        const areaHeight =
          Math.max(...area.tiles.map((tile) => tile.position.y)) - Math.min(...area.tiles.map((tile) => tile.position.y)) + 1;

        return areaWidth + areaHeight;
      });

      return Math.max(...scorePerVillageArea, 0);
    },
  },
];

export const FIELD_WATER_GOALS: Goal[] = [
  {
    name: 'Jorek castle',
    description: '4 points for each column with the same amount of water and field tiles',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 18,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        let waterTiles = 0;
        let fieldTiles = 0;
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (isTileOfLandscape(boardState[x][y], LandscapeType.WATER)) {
            waterTiles++;
          } else if (isTileOfLandscape(boardState[x][y], LandscapeType.FIELD)) {
            fieldTiles++;
          }
        }
        if (waterTiles > 0 && waterTiles === fieldTiles) {
          score += 4;
        }
      }

      return score;
    },
  },
];

export const GLOBAL_GOALS: Goal[] = [
  {
    name: 'Silos',
    description: '10 points for each fully filled odd column',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 30,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        let columnHasEvenIndex = x % 2 === 0;
        let columnIsOdd = columnHasEvenIndex; // array index starts at 0, but column index starts at 1

        if (!columnIsOdd) {
          continue;
        }

        let tiles = 0;
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (isTileFilled(boardState[x][y])) {
            tiles++;
          }
        }
        if (tiles === BOARD_SIZE) {
          score += 10;
        }
      }

      return score;
    },
  },
];

export const GOALS: Goal[] = [...FOREST_GOALS, ...VILLAGE_GOALS, ...FIELD_WATER_GOALS, ...GLOBAL_GOALS];

export function getShuffledGoals(): Goal[] {
  const goals = [...GOALS];
  const shuffledGoals: Goal[] = [];

  while (goals.length > 0) {
    const index = Math.floor(Math.random() * goals.length);
    shuffledGoals.push(goals[index]);
    goals.splice(index, 1);
  }

  return shuffledGoals;
}
