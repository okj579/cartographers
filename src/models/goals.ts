import { BoardTile } from './board-tile';
import { LandscapeType } from './landscape-type';
import { BOARD_SIZE } from '../game-logic/constants';
import { getIndividualAreas, isTileFilled, isTileOfLandscape, LandscapeArea } from '../game-logic/functions';
import { Coordinates, includesCoordinates } from './simple-types';

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
    emojiDescription: '4🎖️ / 1↔️: 3+🌳',
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
    emojiDescription: '6🎖️ / 5+🌳, 🏠⛔',
    category: GoalCategory.FOREST,
    singlePlayerValue: 18,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const forestAreas = getIndividualAreas(boardState, LandscapeType.FOREST);

      const filteredForestAreas = forestAreas.filter((area: LandscapeArea): boolean => {
        if (area.tiles.length < 5) {
          return false;
        }

        for (const tile of area.tiles) {
          const adjacentTiles: Coordinates[] = [
            { x: tile.position.x - 1, y: tile.position.y },
            { x: tile.position.x + 1, y: tile.position.y },
            { x: tile.position.x, y: tile.position.y - 1 },
            { x: tile.position.x, y: tile.position.y + 1 },
          ];

          for (const adjacentTile of adjacentTiles) {
            const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
            if (boardTile && isTileOfLandscape(boardTile, LandscapeType.VILLAGE)) {
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
            const adjacentTiles: Coordinates[] = [
              { x: tile.position.x - 1, y: tile.position.y },
              { x: tile.position.x + 1, y: tile.position.y },
              { x: tile.position.x, y: tile.position.y - 1 },
              { x: tile.position.x, y: tile.position.y + 1 },
            ];

            const areAllAdjacentTilesForest: boolean = adjacentTiles.every((adjacentTile) => {
              const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
              return !boardTile || isTileOfLandscape(boardTile, LandscapeType.FOREST);
            });

            if (areAllAdjacentTilesForest) {
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
    emojiDescription: '1🎖️ / x↔️+y↕️: 1🏠+',
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
  {
    name: 'Monastry',
    description: '7 points for each village area that contains at least 4 village tiles in a straight column',
    emojiDescription: '7🎖️ / 4+🏠, ↕️',
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
        const emptyAdjacentTiles: Coordinates[] = area.tiles.reduce((acc: Coordinates[], tile: BoardTile) => {
          const adjacentTiles: Coordinates[] = [
            { x: tile.position.x - 1, y: tile.position.y },
            { x: tile.position.x + 1, y: tile.position.y },
            { x: tile.position.x, y: tile.position.y - 1 },
            { x: tile.position.x, y: tile.position.y + 1 },
          ];

          return [
            ...acc,
            ...adjacentTiles.filter((adjacentTile) => {
              const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
              return (
                boardTile &&
                isTileOfLandscape(boardTile, undefined) &&
                !acc.find((accTile) => accTile.x === adjacentTile.x && accTile.y === adjacentTile.y)
              );
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
    emojiDescription: '4🎖️ /  ↕️: Σ🌾 = Σ🐟',
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
            const adjacentTiles: Coordinates[] = [
              { x: tile.position.x - 1, y: tile.position.y },
              { x: tile.position.x + 1, y: tile.position.y },
              { x: tile.position.x, y: tile.position.y - 1 },
              { x: tile.position.x, y: tile.position.y + 1 },
            ];

            const adjacentFieldTiles = adjacentTiles.filter((adjacentTile) => {
              const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
              return boardTile && isTileOfLandscape(boardTile, LandscapeType.FIELD);
            });

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
        const adjacentWaterTiles: Coordinates[] = area.tiles.reduce((acc: Coordinates[], tile: BoardTile) => {
          const adjacentTiles: Coordinates[] = [
            { x: tile.position.x - 1, y: tile.position.y },
            { x: tile.position.x + 1, y: tile.position.y },
            { x: tile.position.x, y: tile.position.y - 1 },
            { x: tile.position.x, y: tile.position.y + 1 },
          ];

          return [
            ...acc,
            ...adjacentTiles.filter((adjacentTile) => {
              const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
              return (
                boardTile &&
                isTileOfLandscape(boardTile, LandscapeType.WATER) &&
                !acc.find((accTile) => accTile.x === adjacentTile.x && accTile.y === adjacentTile.y)
              );
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
    description: '5 points for each mointain tile that is connected to a field tile by a path of water tiles',
    emojiDescription: '5🎖️ / 🏔️⏭️🐟+ 🌾',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 15,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      const waterAreas = getIndividualAreas(boardState, LandscapeType.WATER);

      const possibleMountainReservoirs: PossibleMountainReservoir[] = waterAreas.map((area: LandscapeArea): PossibleMountainReservoir => {
        let adjacentFieldTiles: Coordinates[] = [];
        let adjacentMountainTiles: Coordinates[] = [];

        for (const tile of area.tiles) {
          const { x, y } = tile.position;
          const adjacentTiles: Coordinates[] = [
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y - 1 },
            { x, y: y + 1 },
          ];

          for (const adjacentTile of adjacentTiles) {
            const boardTile = boardState[adjacentTile.x]?.[adjacentTile.y];
            if (boardTile && isTileOfLandscape(boardTile, LandscapeType.FIELD) && !includesCoordinates(adjacentTile, adjacentFieldTiles)) {
              adjacentFieldTiles.push(adjacentTile);
            } else if (
              boardTile &&
              isTileOfLandscape(boardTile, LandscapeType.MOUNTAIN) &&
              !includesCoordinates(adjacentTile, adjacentMountainTiles)
            ) {
              adjacentMountainTiles.push(adjacentTile);
            }
          }
        }

        return {
          numberOfFieldTiles: adjacentFieldTiles.length,
          numberOfMountainTiles: adjacentMountainTiles.length,
        };
      });

      const numberOfMountainReservoirs = possibleMountainReservoirs.reduce((acc: number, reservoir: PossibleMountainReservoir) => {
        if (reservoir.numberOfFieldTiles === 0 || reservoir.numberOfMountainTiles === 0) {
          return acc;
        }

        return acc + reservoir.numberOfMountainTiles;
      }, 0);

      return 5 * numberOfMountainReservoirs;
    },
  },
];

interface PossibleMountainReservoir {
  numberOfFieldTiles: number;
  numberOfMountainTiles: number;
}

export const GLOBAL_GOALS: Goal[] = [
  {
    name: 'Silos',
    description: '10 points for each fully filled odd column',
    emojiDescription: '10🎖️ / odd↕️: 💯',
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
    emojiDescription: '4🎖️ / 1↔️: 5+🌈',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 28,
    scoreAlgorithm: (boardState: BoardTile[][]) => {
      let score = 0;

      for (let y = 0; y < BOARD_SIZE; y++) {
        let landscapeTypes = new Set<LandscapeType>();
        for (let x = 0; x < BOARD_SIZE; x++) {
          const type = boardState[x][y].landscape;
          if (type) {
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
      const emptyAreas = getIndividualAreas(boardState, undefined);

      const filteredEmptyAreas = emptyAreas.filter((area: LandscapeArea): boolean => {
        return area.tiles.length === 3;
      });

      return 4 * filteredEmptyAreas.length;
    },
  },
  {
    name: 'Dwarf castles',
    description: '7 points for each row or column which is completely filled and contains a mountain tile',
    emojiDescription: '7🎖️ / 1↔️+↕️: 💯+🏔️',
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
  const monsterAreas = getIndividualAreas(boardState, LandscapeType.MONSTER);

  // one minus point for each empty tile that is adjacent to at least one monster tile
  const adjacentTiles: Coordinates[] = monsterAreas
    .map((area) => area.tiles)
    .flat()
    .reduce((acc: Coordinates[], tile: BoardTile) => {
      const adjacentTiles = [
        { x: tile.position.x - 1, y: tile.position.y },
        { x: tile.position.x + 1, y: tile.position.y },
        { x: tile.position.x, y: tile.position.y - 1 },
        { x: tile.position.x, y: tile.position.y + 1 },
      ];

      return [...acc, ...adjacentTiles];
    }, []);

  // remove duplicates
  const uniqueAdjacentTiles = adjacentTiles.reduce((acc: Coordinates[], tile: Coordinates) => {
    if (!acc.find((accTile) => accTile.x === tile.x && accTile.y === tile.y)) {
      return [...acc, tile];
    }

    return acc;
  }, []);

  const emptyAdjacentTiles = uniqueAdjacentTiles.filter((tile) => {
    const boardTile = boardState[tile.x]?.[tile.y];
    return boardTile && isTileOfLandscape(boardTile, undefined);
  });

  return emptyAdjacentTiles.length * -1;
}
