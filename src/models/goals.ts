import { BoardTile, tilesToCoordinates } from './board-tile';
import { LandscapeType } from './landscape-type';
import { BOARD_SIZE } from '../game-logic/constants';
import { getAdjacentTiles, getIndividualAreas, isTileFilled, isTileOfLandscape, LandscapeArea } from '../game-logic/functions';
import { includesCoordinates } from './simple-types';

export enum GoalCategory {
  FOREST = 'forest',
  VILLAGE = 'village',
  FIELD_WATER = 'field-water',
  GLOBAL = 'global',
}

export interface Goal {
  name: string;
  description: string;
  emojiDescription: string;
  category: GoalCategory;
  singlePlayerValue: number;
  scoreAlgorithm: (boardState: BoardTile[][]) => number;
}

export const FOREST_GOALS: Goal[] = [
  {
    name: 'Sleepy Forest',
    description: '4 points for each row with at least 3 forest tiles',
    emojiDescription: '4🎖️ / ↔️: 3+🌳',
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
  {
    name: 'Remote Forest',
    description: '6 points for each forest area that contains at least 5 forest tiles and has no adjacent village tiles',
    emojiDescription: '6🎖️ / 5+🌳 ⛔🏠',
    category: GoalCategory.FOREST,
    singlePlayerValue: 18,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const forestAreas = getIndividualAreas(boardState, LandscapeType.FOREST);

      const filteredForestAreas = forestAreas.filter((area: LandscapeArea): boolean => {
        if (area.tiles.length < 5) {
          return false;
        }

        for (const tile of area.tiles) {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          for (const boardTile of adjacentTiles) {
            if (isTileOfLandscape(boardTile, LandscapeType.VILLAGE)) {
              return false;
            }
          }
        }

        return true;
      });

      return 6 * filteredForestAreas.length;
    },
  },
  {
    name: 'Faun Forest',
    description: '2 points for each forest tile that is in the longest column of forest tiles',
    emojiDescription: '2🎖️ / max↕️: 🌳',
    category: GoalCategory.FOREST,
    singlePlayerValue: 16,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        let columnsMaxForestTiles = 0;
        let forestTiles = 0;
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (isTileOfLandscape(boardState[x][y], LandscapeType.FOREST)) {
            forestTiles++;
          } else {
            if (forestTiles > columnsMaxForestTiles) {
              columnsMaxForestTiles = forestTiles;
            }
            forestTiles = 0;
          }
        }
        if (forestTiles > columnsMaxForestTiles) {
          columnsMaxForestTiles = forestTiles;
        }
        if (columnsMaxForestTiles > score) {
          score = columnsMaxForestTiles;
        }
      }

      return score * 2;
    },
  },
  {
    name: 'Heart of the Forest',
    description: '2 points for each forest tile that is only adjacent to forest tiles or the edge of the board',
    emojiDescription: '2🎖️ / 🌳, ⏭️🌳💯',
    category: GoalCategory.FOREST,
    singlePlayerValue: 22,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const tile = boardState[x][y];
          if (isTileOfLandscape(tile, LandscapeType.FOREST)) {
            const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

            if (adjacentTiles.every((boardTile) => isTileOfLandscape(boardTile, LandscapeType.FOREST))) {
              score += 2;
            }
          }
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
    emojiDescription: '1🎖️ / ↔️+↕️: 1🏠+',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 16,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const scorePerVillageArea = villageAreas.map((area) => {
        const xValues: number[] = area.tiles.map((tile) => tile.position.x);
        const yValues: number[] = area.tiles.map((tile) => tile.position.y);
        const areaWidth = Math.max(...xValues) - Math.min(...xValues) + 1;
        const areaHeight = Math.max(...yValues) - Math.min(...yValues) + 1;

        return areaWidth + areaHeight;
      });

      return Math.max(...scorePerVillageArea, 0);
    },
  },
  {
    name: 'Monastry',
    description: '7 points for each village area that contains at least 4 village tiles in a straight line',
    emojiDescription: '7🎖️ / 1x4🏠',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 14,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const filteredVillageAreas = villageAreas.filter((area: LandscapeArea): boolean => {
        if (area.tiles.length < 4) {
          return false;
        }

        for (const tile of area.tiles) {
          const { x, y } = tile.position;
          const columnTiles: BoardTile[] = [boardState[x][y], boardState[x][y + 1], boardState[x][y + 2], boardState[x][y + 3]];

          if (columnTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            return true;
          }

          const rowTiles: BoardTile[] = [boardState[x][y], boardState[x + 1]?.[y], boardState[x + 2]?.[y], boardState[x + 3]?.[y]];

          if (rowTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            return true;
          }
        }

        return false;
      });

      return 7 * filteredVillageAreas.length;
    },
  },
  {
    name: 'Gnome Colony',
    description: '6 points for each village area that contains at least 1 square of 2x2 village tiles',
    emojiDescription: '6🎖️ / 2x2🏠',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const filteredVillageAreas = villageAreas.filter((area: LandscapeArea): boolean => {
        for (const tile of area.tiles) {
          const { x, y } = tile.position;
          const squareTiles: BoardTile[] = [boardState[x][y], boardState[x + 1]?.[y], boardState[x][y + 1], boardState[x + 1]?.[y + 1]];

          if (squareTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            return true;
          }
        }

        return false;
      });

      return 6 * filteredVillageAreas.length;
    },
  },
  {
    name: 'The outermost village',
    description: '1 point for each empty tile that is adjacent to one village area',
    emojiDescription: '1🎖️ / 🔲⏭️1🏠+',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const scorePerVillageArea = villageAreas.map((area) => {
        const emptyAdjacentTiles: BoardTile[] = area.tiles.reduce((acc: BoardTile[], tile: BoardTile) => {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          return [
            ...acc,
            ...adjacentTiles.filter((boardTile) => {
              return isTileOfLandscape(boardTile, undefined) && !includesCoordinates(boardTile.position, tilesToCoordinates(acc));
            }),
          ];
        }, []);

        return emptyAdjacentTiles.length;
      });

      return Math.max(...scorePerVillageArea, 0);
    },
  },
];

export const FIELD_WATER_GOALS: Goal[] = [
  {
    name: 'Jorek castle',
    description: '4 points for each column with the same amount of water and field tiles',
    emojiDescription: '4🎖️ /  ↕️: Σ🌾=Σ🐟',
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
  {
    name: 'Ulem Swamp',
    description: '4 points for each water tile that is adjacent to at least two field tiles',
    emojiDescription: '4🎖️ / 🐟⏭️ 2+🌾',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 14,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const tile = boardState[x][y];
          if (isTileOfLandscape(tile, LandscapeType.WATER)) {
            const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);
            const adjacentFieldTiles = adjacentTiles.filter((boardTile) => isTileOfLandscape(boardTile, LandscapeType.FIELD));

            if (adjacentFieldTiles.length >= 2) {
              score += 4;
            }
          }
        }
      }

      return score;
    },
  },
  {
    name: 'Lake area',
    description: '7 points for each field area that is adjacent to at least 3 water tiles',
    emojiDescription: '7🎖️ / 🌾+ ⏭️ 3+🐟',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const fieldAreas = getIndividualAreas(boardState, LandscapeType.FIELD);

      const filteredFieldAreas = fieldAreas.filter((area: LandscapeArea): boolean => {
        const adjacentWaterTiles: BoardTile[] = area.tiles.reduce((acc: BoardTile[], tile: BoardTile) => {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          return [
            ...acc,
            ...adjacentTiles.filter((boardTile) => {
              return isTileOfLandscape(boardTile, LandscapeType.WATER) && !includesCoordinates(boardTile.position, tilesToCoordinates(acc));
            }),
          ];
        }, []);

        return adjacentWaterTiles.length >= 3;
      });

      return 7 * filteredFieldAreas.length;
    },
  },
  {
    name: 'Mountain reservoir',
    description: '5 points for each mountain tile that is connected to a field tile by a path of water tiles',
    emojiDescription: '5🎖️ / 🏔️⏭️🐟🌾',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 15,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const waterAreas = getIndividualAreas(boardState, LandscapeType.WATER);

      const possibleMountainReservoirs: PossibleMountainReservoir[] = waterAreas.map((area: LandscapeArea): PossibleMountainReservoir => {
        let adjacentFieldTiles: BoardTile[] = [];
        let adjacentMountainTiles: BoardTile[] = [];

        for (const tile of area.tiles) {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          for (const boardTile of adjacentTiles) {
            if (isTileOfLandscape(boardTile, LandscapeType.FIELD)) {
              adjacentFieldTiles.push(boardTile);
            } else if (isTileOfLandscape(boardTile, LandscapeType.MOUNTAIN)) {
              adjacentMountainTiles.push(boardTile);
            }
          }
        }

        return {
          adjacentFieldTiles,
          adjacentMountainTiles,
        };
      });

      const foundMountains: BoardTile[] = [];

      for (const reservoir of possibleMountainReservoirs) {
        if (reservoir.adjacentFieldTiles.length === 0 || reservoir.adjacentMountainTiles.length === 0) {
          continue;
        }

        for (const mountainTile of reservoir.adjacentMountainTiles) {
          if (!includesCoordinates(mountainTile.position, tilesToCoordinates(foundMountains))) {
            foundMountains.push(mountainTile);
          }
        }
      }

      return 5 * foundMountains.length;
    },
  },
];

interface PossibleMountainReservoir {
  adjacentFieldTiles: BoardTile[];
  adjacentMountainTiles: BoardTile[];
}

export const GLOBAL_GOALS: Goal[] = [
  {
    name: 'Silos',
    description: '10 points for each fully filled odd column',
    emojiDescription: '10🎖️ / odd↕️💯',
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
  {
    name: 'Hills of Tolerance',
    description: '4 points for each row with at least 5 different landscape types',
    emojiDescription: '4🎖️ / 1↔️:5🌈',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 28,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let y = 0; y < BOARD_SIZE; y++) {
        let landscapeTypes = new Set<LandscapeType>();
        for (let x = 0; x < BOARD_SIZE; x++) {
          const tile = boardState[x][y];
          const type = tile.landscape;
          if (type && !tile.destroyed) {
            landscapeTypes.add(type);
          }
        }
        if (landscapeTypes.size >= 5) {
          score += 4;
        }
      }

      return score;
    },
  },
  {
    name: 'Holey Stars',
    description: '4 points for each empty area that contains exactly 3 empty tiles',
    emojiDescription: '4🎖️ / 3🔲',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 30,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const emptyAreas: LandscapeArea[] = getIndividualAreas(boardState, undefined);
      const filteredEmptyAreas: LandscapeArea[] = emptyAreas.filter((area: LandscapeArea): boolean => area.tiles.length === 3);

      return 4 * filteredEmptyAreas.length;
    },
  },
  {
    name: 'Dwarf castles',
    description: '7 points for each row or column which is completely filled and contains a mountain tile',
    emojiDescription: '7🎖️ / ↔️+↕️:💯+🏔️',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 28,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let x = 0; x < BOARD_SIZE; x++) {
        let rowHasEmptyTile = false;
        let rowHasMountainTile = false;
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (!isTileFilled(boardState[x][y])) {
            rowHasEmptyTile = true;
          }
          if (isTileOfLandscape(boardState[x][y], LandscapeType.MOUNTAIN)) {
            rowHasMountainTile = true;
          }
        }
        if (!rowHasEmptyTile && rowHasMountainTile) {
          score += 7;
        }
      }

      for (let y = 0; y < BOARD_SIZE; y++) {
        let columnHasEmptyTile = false;
        let columnHasMountainTile = false;
        for (let x = 0; x < BOARD_SIZE; x++) {
          if (!isTileFilled(boardState[x][y])) {
            columnHasEmptyTile = true;
          }
          if (isTileOfLandscape(boardState[x][y], LandscapeType.MOUNTAIN)) {
            columnHasMountainTile = true;
          }
        }
        if (!columnHasEmptyTile && columnHasMountainTile) {
          score += 7;
        }
      }

      return score;
    },
  },
];

export const ALL_GOALS: Goal[] = [...FOREST_GOALS, ...VILLAGE_GOALS, ...FIELD_WATER_GOALS, ...GLOBAL_GOALS];

export function findGoalByName(name: string): Goal | undefined {
  return ALL_GOALS.find((goal) => goal.name === name);
}

function getRandomArrayElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getShuffledGoals(): Goal[] {
  const goals = [
    getRandomArrayElement(FOREST_GOALS),
    getRandomArrayElement(VILLAGE_GOALS),
    getRandomArrayElement(FIELD_WATER_GOALS),
    getRandomArrayElement(GLOBAL_GOALS),
  ];
  const shuffledGoals: Goal[] = [];

  while (goals.length > 0) {
    const index = Math.floor(Math.random() * goals.length);
    shuffledGoals.push(goals[index]);
    goals.splice(index, 1);
  }

  return shuffledGoals;
}

export function getMonsterScore(boardState: BoardTile[][]): number {
  // one minus point for each empty tile that is adjacent to at least one monster tile
  let score: number = 0;

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const tile = boardState[x][y];
      if (isTileOfLandscape(tile, undefined)) {
        const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

        if (adjacentTiles.some((boardTile) => isTileOfLandscape(boardTile, LandscapeType.MONSTER))) {
          score--;
        }
      }
    }
  }

  return score;
}
