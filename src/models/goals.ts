import { BoardTile, getRowTiles, tilesToCoordinates } from './board-tile';
import { LandscapeType } from './landscape-type';
import { BOARD_SIZE } from '../game-logic/constants';
import { getAdjacentTiles, getIndividualAreas, isTileFilled, isTileOfLandscape, LandscapeArea } from '../game-logic/functions';
import { Coordinates, includesCoordinates } from './simple-types';
import { MonsterType } from './monster';

export enum GoalCategory {
  FOREST = 'forest',
  VILLAGE = 'village',
  FIELD_WATER = 'field-water',
  GLOBAL = 'global',
  MONSTER = 'monster',
  COIN = 'coin',
}

export interface Goal {
  name: string;
  description: string;
  emojiDescription: string;
  goalEmoji?: string;
  category: GoalCategory;
  singlePlayerValue: number;
  scoreAlgorithm: (boardState: BoardTile[][]) => ScoreInfo;
}

export type ScoreType = 'tile' | 'row' | 'column' | 'row+column' | 'area';

export interface ScoreIndicator extends Partial<Coordinates> {
  scorePerEntity?: number;
}

export interface ScoreInfo {
  goalCategory: GoalCategory;
  scoreType: ScoreType;
  scorePerEntity: number;
  score: number;
  scoredTiles: BoardTile[];
  relatedTiles?: BoardTile[];
  scoreIndicatorPositions: ScoreIndicator[];
}

export const FOREST_GOALS: Goal[] = [
  {
    name: 'Sleepy Forest',
    description: '4 points for each row with at least 3 forest tiles',
    emojiDescription: '4🎖️ / ↔️: 3+🌳',
    category: GoalCategory.FOREST,
    singlePlayerValue: 24,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredTiles: BoardTile[] = [];
      const relatedTiles: BoardTile[] = [];
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];

      for (let y = 0; y < BOARD_SIZE; y++) {
        const row = getRowTiles(boardState, y);
        const forestTiles: BoardTile[] = row.filter((tile) => isTileOfLandscape(tile, LandscapeType.FOREST));

        if (forestTiles.length >= 3) {
          scoreIndicatorPositions.push({ y });
          scoredTiles.push(...forestTiles.slice(0, 3));
          relatedTiles.push(...forestTiles);
        }
      }

      return {
        goalCategory: GoalCategory.FOREST,
        scoreType: 'row',
        scorePerEntity: 4,
        score: 4 * scoreIndicatorPositions.length,
        scoredTiles,
        relatedTiles,
        scoreIndicatorPositions,
      };
    },
  },
  {
    name: 'Remote Forest',
    description: '6 points for each forest area that contains at least 5 forest tiles and has no adjacent village tiles',
    emojiDescription: '6🎖️ / 5+🌳 ⛔🏠',
    category: GoalCategory.FOREST,
    singlePlayerValue: 18,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const forestAreas = getIndividualAreas(boardState, LandscapeType.FOREST);
      const relatedTiles: BoardTile[] = [];

      const filteredForestAreas = forestAreas.filter((area: LandscapeArea): boolean => {
        if (area.tiles.length < 5) {
          return false;
        }

        for (const tile of area.tiles) {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          for (const boardTile of adjacentTiles) {
            if (isTileOfLandscape(boardTile, LandscapeType.VILLAGE)) {
              // relatedTiles.push(boardTile); // todo - what would be helpful?

              return false;
            }
          }
        }

        return true;
      });

      return {
        goalCategory: GoalCategory.FOREST,
        scoreType: 'area',
        scorePerEntity: 6,
        score: 6 * filteredForestAreas.length,
        scoredTiles: filteredForestAreas.flatMap((area) => area.tiles.slice(0, 5)), // todo - as expected?
        relatedTiles: [...relatedTiles, ...filteredForestAreas.flatMap((area) => area.tiles)],
        scoreIndicatorPositions: filteredForestAreas.map((area) => area.tiles[0].position),
      };
    },
  },
  {
    name: 'Faun Forest',
    description: '2 points for each forest tile that is in the longest column of forest tiles',
    emojiDescription: '2🎖️ / max↕️: 🌳',
    category: GoalCategory.FOREST,
    singlePlayerValue: 16,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      let scoredTiles: BoardTile[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        let columnsMaxForestTiles: BoardTile[] = [];
        let forestTiles: BoardTile[] = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (isTileOfLandscape(boardState[x][y], LandscapeType.FOREST)) {
            forestTiles.push(boardState[x][y]);
          } else {
            if (forestTiles.length > columnsMaxForestTiles.length) {
              columnsMaxForestTiles = forestTiles;
            }
            forestTiles = [];
          }
        }
        if (forestTiles.length > columnsMaxForestTiles.length) {
          columnsMaxForestTiles = forestTiles;
        }
        if (columnsMaxForestTiles.length > scoredTiles.length) {
          scoredTiles = columnsMaxForestTiles;
        }
      }

      return {
        goalCategory: GoalCategory.FOREST,
        scoreType: 'tile',
        scorePerEntity: 2,
        score: 2 * scoredTiles.length,
        scoredTiles,
        scoreIndicatorPositions: scoredTiles.map((tile) => tile.position),
      };
    },
  },
  {
    name: 'Heart of the Forest',
    description: '2 points for each forest tile that is only adjacent to forest tiles or the edge of the board',
    emojiDescription: '2🎖️ / 🌳, ⏭️🌳💯',
    category: GoalCategory.FOREST,
    singlePlayerValue: 22,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredTiles: BoardTile[] = [];
      const relatedTiles: BoardTile[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const tile = boardState[x][y];
          if (isTileOfLandscape(tile, LandscapeType.FOREST)) {
            const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

            if (adjacentTiles.every((boardTile) => isTileOfLandscape(boardTile, LandscapeType.FOREST))) {
              scoredTiles.push(tile);
              relatedTiles.push(...adjacentTiles);
            }
          }
        }
      }

      return {
        goalCategory: GoalCategory.FOREST,
        scoreType: 'tile',
        scorePerEntity: 2,
        score: 2 * scoredTiles.length,
        scoredTiles,
        relatedTiles,
        scoreIndicatorPositions: scoredTiles.map((tile) => tile.position),
      };
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
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const scorePerVillageArea: ScoreInfo[] = villageAreas.map((area): ScoreInfo => {
        const xValues: number[] = area.tiles.map((tile) => tile.position.x);
        const yValues: number[] = area.tiles.map((tile) => tile.position.y);
        const areaWidth = Math.max(...xValues) - Math.min(...xValues) + 1;
        const areaHeight = Math.max(...yValues) - Math.min(...yValues) + 1;
        const uniqueXValues = Array.from(new Set(xValues));
        const uniqueYValues = Array.from(new Set(yValues));

        return {
          goalCategory: GoalCategory.VILLAGE,
          scoreType: 'row+column',
          scorePerEntity: 1,
          score: areaWidth + areaHeight,
          scoredTiles: area.tiles,
          scoreIndicatorPositions: [...uniqueXValues.map((x) => ({ x })), ...uniqueYValues.map((y) => ({ y }))],
        };
      });

      return getMaxScoreInfo(scorePerVillageArea) ?? getFallbackScoreInfo(GoalCategory.VILLAGE);
    },
  },
  {
    name: 'Monastry',
    description: '7 points for each village area that contains at least 4 village tiles in a straight line',
    emojiDescription: '7🎖️ / 1x4🏠',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 14,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);
      const scoredTiles: BoardTile[] = [];
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];

      const filteredVillageAreas = villageAreas.filter((area: LandscapeArea): boolean => {
        if (area.tiles.length < 4) {
          return false;
        }

        for (const tile of area.tiles) {
          const { x, y } = tile.position;
          const columnTiles: BoardTile[] = [boardState[x][y], boardState[x][y + 1], boardState[x][y + 2], boardState[x][y + 3]];

          if (columnTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            scoreIndicatorPositions.push(tile.position);
            scoredTiles.push(...columnTiles);
            return true;
          }

          const rowTiles: BoardTile[] = [boardState[x][y], boardState[x + 1]?.[y], boardState[x + 2]?.[y], boardState[x + 3]?.[y]];

          if (rowTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            scoreIndicatorPositions.push(tile.position);
            scoredTiles.push(...rowTiles);
            return true;
          }
        }

        return false;
      });

      return {
        goalCategory: GoalCategory.VILLAGE,
        scoreType: 'area',
        scorePerEntity: 7,
        score: 7 * scoreIndicatorPositions.length,
        scoredTiles,
        scoreIndicatorPositions,
        relatedTiles: filteredVillageAreas.flatMap((area) => area.tiles),
      };
    },
  },
  {
    name: 'Gnome Colony',
    description: '6 points for each village area that contains at least 1 square of 2x2 village tiles',
    emojiDescription: '6🎖️ / 2x2🏠',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);
      const scoredTiles: BoardTile[] = [];
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];

      const filteredVillageAreas = villageAreas.filter((area: LandscapeArea): boolean => {
        for (const tile of area.tiles) {
          const { x, y } = tile.position;
          const squareTiles: BoardTile[] = [boardState[x][y], boardState[x + 1]?.[y], boardState[x][y + 1], boardState[x + 1]?.[y + 1]];

          if (squareTiles.every((tile) => tile && isTileOfLandscape(tile, LandscapeType.VILLAGE))) {
            scoredTiles.push(...squareTiles);
            scoreIndicatorPositions.push(tile.position);

            return true;
          }
        }

        return false;
      });

      return {
        goalCategory: GoalCategory.VILLAGE,
        scoreType: 'area',
        scorePerEntity: 6,
        score: 6 * scoreIndicatorPositions.length,
        scoredTiles,
        scoreIndicatorPositions,
        relatedTiles: filteredVillageAreas.flatMap((area) => area.tiles),
      };
    },
  },
  {
    name: 'The outermost village',
    description: '1 point for each empty tile that is adjacent to one village area',
    emojiDescription: '1🎖️ / 🔲⏭️1🏠+',
    category: GoalCategory.VILLAGE,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const villageAreas = getIndividualAreas(boardState, LandscapeType.VILLAGE);

      const scorePerVillageArea: ScoreInfo[] = villageAreas.map((area): ScoreInfo => {
        const emptyAdjacentTiles: BoardTile[] = area.tiles.reduce((acc: BoardTile[], tile: BoardTile) => {
          const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);

          return [
            ...acc,
            ...adjacentTiles.filter((boardTile) => {
              return isTileOfLandscape(boardTile, undefined) && !includesCoordinates(boardTile.position, tilesToCoordinates(acc));
            }),
          ];
        }, []);

        return {
          goalCategory: GoalCategory.VILLAGE,
          scoreType: 'tile',
          scorePerEntity: 1,
          score: emptyAdjacentTiles.length,
          scoredTiles: emptyAdjacentTiles,
          scoreIndicatorPositions: emptyAdjacentTiles.map((tile) => tile.position),
          relatedTiles: area.tiles,
        };
      });

      return getMaxScoreInfo(scorePerVillageArea) ?? getFallbackScoreInfo(GoalCategory.VILLAGE);
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
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredColumns: number[] = [];
      const scoredTiles: BoardTile[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        let waterTiles: BoardTile[] = boardState[x].filter((tile) => isTileOfLandscape(tile, LandscapeType.WATER));
        let fieldTiles: BoardTile[] = boardState[x].filter((tile) => isTileOfLandscape(tile, LandscapeType.FIELD));

        if (waterTiles.length > 0 && waterTiles.length === fieldTiles.length) {
          scoredColumns.push(x);
          scoredTiles.push(...waterTiles);
          scoredTiles.push(...fieldTiles);
        }
      }

      return {
        goalCategory: GoalCategory.FIELD_WATER,
        scoreType: 'column',
        scorePerEntity: 4,
        score: 4 * scoredColumns.length,
        scoredTiles,
        scoreIndicatorPositions: scoredColumns.map((x) => ({ x })),
      };
    },
  },
  {
    name: 'Ulem Swamp',
    description: '4 points for each water tile that is adjacent to at least two field tiles',
    emojiDescription: '4🎖️ / 🐟⏭️ 2+🌾',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 14,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredTiles: BoardTile[] = [];
      const relatedTiles: BoardTile[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const tile = boardState[x][y];
          if (isTileOfLandscape(tile, LandscapeType.WATER)) {
            const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);
            const adjacentFieldTiles = adjacentTiles.filter((boardTile) => isTileOfLandscape(boardTile, LandscapeType.FIELD));

            if (adjacentFieldTiles.length >= 2) {
              scoredTiles.push(tile);
              relatedTiles.push(...adjacentFieldTiles);
            }
          }
        }
      }

      return {
        goalCategory: GoalCategory.FIELD_WATER,
        scoreType: 'tile',
        scorePerEntity: 4,
        score: 4 * scoredTiles.length,
        scoredTiles,
        scoreIndicatorPositions: scoredTiles.map((tile) => tile.position),
        relatedTiles,
      };
    },
  },
  {
    name: 'Lake area',
    description: '7 points for each field area that is adjacent to at least 3 water tiles',
    emojiDescription: '7🎖️ / 🌾+ ⏭️ 3+🐟',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 12,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const fieldAreas = getIndividualAreas(boardState, LandscapeType.FIELD);
      const relatedTiles: BoardTile[] = [];

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

        if (adjacentWaterTiles.length >= 3) {
          relatedTiles.push(...adjacentWaterTiles);
          return true;
        }

        return false;
      });

      return {
        goalCategory: GoalCategory.FIELD_WATER,
        scoreType: 'area',
        scorePerEntity: 7,
        score: 7 * filteredFieldAreas.length,
        scoredTiles: filteredFieldAreas.flatMap((area) => area.tiles),
        scoreIndicatorPositions: filteredFieldAreas.map((area) => area.tiles[0].position),
        relatedTiles,
      };
    },
  },
  {
    name: 'Mountain reservoir',
    description: '5 points for each mountain tile that is connected to a field tile by a path of water tiles',
    emojiDescription: '5🎖️ / 🏔️⏭️🐟🌾',
    category: GoalCategory.FIELD_WATER,
    singlePlayerValue: 15,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const waterAreas = getIndividualAreas(boardState, LandscapeType.WATER);
      const relatedTiles: BoardTile[] = [];

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
          waterArea: area,
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
            relatedTiles.push(...reservoir.adjacentFieldTiles, ...reservoir.waterArea.tiles);
          }
        }
      }

      return {
        goalCategory: GoalCategory.FIELD_WATER,
        scoreType: 'tile',
        scorePerEntity: 5,
        score: 5 * foundMountains.length,
        scoredTiles: foundMountains,
        relatedTiles,
        scoreIndicatorPositions: foundMountains.map((tile) => tile.position),
      };
    },
  },
];

interface PossibleMountainReservoir {
  waterArea: LandscapeArea;
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
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredTiles: BoardTile[] = [];
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        let columnHasEvenIndex = x % 2 === 0;
        let columnIsOdd = columnHasEvenIndex; // array index starts at 0, but column index starts at 1

        if (!columnIsOdd) {
          continue;
        }

        let filledColumnTiles: BoardTile[] = boardState[x].filter((tile) => isTileFilled(tile));

        if (filledColumnTiles.length === BOARD_SIZE) {
          scoredTiles.push(...filledColumnTiles);
          scoreIndicatorPositions.push({ x });
        }
      }

      return {
        goalCategory: GoalCategory.GLOBAL,
        scoreType: 'column',
        scorePerEntity: 10,
        score: 10 * scoreIndicatorPositions.length,
        scoredTiles,
        scoreIndicatorPositions,
      };
    },
  },
  {
    name: 'Hills of Tolerance',
    description: '4 points for each row with at least 5 different landscape types',
    emojiDescription: '4🎖️ / 1↔️:5🌈',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 28,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoredTiles: BoardTile[] = [];
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];
      const relatedTiles: BoardTile[] = [];

      for (let y = 0; y < BOARD_SIZE; y++) {
        const landscapeTypes = new Set<LandscapeType>();
        const tiles: BoardTile[] = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
          const tile = boardState[x][y];
          const type = tile.landscape;
          if (type && !tile.destroyed && !landscapeTypes.has(type)) {
            landscapeTypes.add(type);
            tiles.push(tile);
          }
        }
        if (landscapeTypes.size >= 5) {
          scoreIndicatorPositions.push({ y });
          scoredTiles.push(...tiles.slice(0, 5));
          relatedTiles.push(...tiles);
        }
      }

      return {
        goalCategory: GoalCategory.GLOBAL,
        scoreType: 'row',
        scorePerEntity: 4,
        score: 4 * scoreIndicatorPositions.length,
        scoredTiles,
        scoreIndicatorPositions,
        relatedTiles,
      };
    },
  },
  {
    name: 'Holey Stars',
    description: '4 points for each empty area that contains exactly 3 empty tiles',
    emojiDescription: '4🎖️ / 3🔲',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 30,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const emptyAreas: LandscapeArea[] = getIndividualAreas(boardState, undefined);
      const filteredEmptyAreas: LandscapeArea[] = emptyAreas.filter((area: LandscapeArea): boolean => area.tiles.length === 3);

      return {
        goalCategory: GoalCategory.GLOBAL,
        scoreType: 'area',
        scorePerEntity: 4,
        score: 4 * filteredEmptyAreas.length,
        scoredTiles: filteredEmptyAreas.flatMap((area) => area.tiles),
        scoreIndicatorPositions: filteredEmptyAreas.map((area) => area.tiles[0].position),
      };
    },
  },
  {
    name: 'Dwarf castles',
    description: '7 points for each row or column which is completely filled and contains a mountain tile',
    emojiDescription: '7🎖️ / ↔️+↕️:💯+🏔️',
    category: GoalCategory.GLOBAL,
    singlePlayerValue: 28,
    scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
      const scoreIndicatorPositions: Partial<Coordinates>[] = [];
      const scoredTiles: BoardTile[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        const column = boardState[x];
        const hasMountainTile = column.some((tile) => isTileOfLandscape(tile, LandscapeType.MOUNTAIN));

        if (hasMountainTile && column.every((tile) => isTileFilled(tile))) {
          scoreIndicatorPositions.push({ x });
          scoredTiles.push(...column);
        }
      }

      for (let y = 0; y < BOARD_SIZE; y++) {
        const row = getRowTiles(boardState, y);
        const hasMountainTile = row.some((tile) => isTileOfLandscape(tile, LandscapeType.MOUNTAIN));

        if (hasMountainTile && row.every((tile) => isTileFilled(tile))) {
          scoreIndicatorPositions.push({ y });
          scoredTiles.push(...row);
        }
      }

      return {
        goalCategory: GoalCategory.GLOBAL,
        scoreType: 'row+column',
        scorePerEntity: 7,
        score: 7 * scoreIndicatorPositions.length,
        scoredTiles,
        scoreIndicatorPositions,
      };
    },
  },
];

export const COIN_GOAL: Goal = {
  name: 'Collect coins',
  description: 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes',
  emojiDescription: '1🎖️ / 💎',
  goalEmoji: '💎',
  category: GoalCategory.COIN,
  singlePlayerValue: 0,
  scoreAlgorithm: (boardState: BoardTile[][]): ScoreInfo => {
    const relatedTiles: BoardTile[] = boardState.flatMap((column) => column.filter((tile) => tile.wasScoreCoin));
    const scoreIndicatorPositions: ScoreIndicator[] = relatedTiles.map((tile) => ({
      ...tile.position,
      scorePerEntity: (tile.wasScoreCoin ? 1 : 0) * (tile.monsterType === MonsterType.DRAGON ? 3 : 1),
    }));

    // todo - max score of 14
    const score = scoreIndicatorPositions.reduce((acc, scoreIndicator) => acc + (scoreIndicator.scorePerEntity ?? 0), 0);

    return {
      goalCategory: GoalCategory.COIN,
      scoreType: 'tile',
      scorePerEntity: 1,
      score,
      scoredTiles: [],
      relatedTiles,
      scoreIndicatorPositions,
    };
  },
};

export const MONSTER_GOAL: Goal = {
  name: 'Defeat monsters',
  description: 'One minus point for each empty tile that is adjacent to at least one monster tile',
  emojiDescription: '-1🎖️ / 🔲⏭️😈',
  goalEmoji: '😈',
  category: GoalCategory.MONSTER,
  singlePlayerValue: 0,
  scoreAlgorithm: getMonsterScore,
};

const ALL_GOALS: Goal[] = [...FOREST_GOALS, ...VILLAGE_GOALS, ...FIELD_WATER_GOALS, ...GLOBAL_GOALS, MONSTER_GOAL, COIN_GOAL];

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

export function isDefaultGoal(goal: Goal): boolean {
  return [GoalCategory.COIN, GoalCategory.MONSTER].includes(goal.category);
}

export function getGoalsFromIndexes(indexes: number[]): Goal[] {
  return indexes.map((index) => ALL_GOALS[index]);
}

export function getMonsterScore(boardState: BoardTile[][]): ScoreInfo {
  // one minus point for each empty tile that is adjacent to at least one monster tile
  const scoredTiles: BoardTile[] = [];
  const relatedTiles: BoardTile[] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const tile = boardState[x][y];
      if (isTileOfLandscape(tile, undefined)) {
        const adjacentTiles: BoardTile[] = getAdjacentTiles(boardState, tile.position);
        const adjacentMonsterTiles = adjacentTiles.filter((boardTile) => isTileOfLandscape(boardTile, LandscapeType.MONSTER));

        if (adjacentMonsterTiles.length > 0) {
          scoredTiles.push(tile);
          relatedTiles.push(...adjacentMonsterTiles);
        }
      }
    }
  }

  return {
    goalCategory: GoalCategory.MONSTER,
    scoreType: 'tile',
    scorePerEntity: -1,
    score: scoredTiles.length ? -1 * scoredTiles.length : 0,
    scoredTiles,
    scoreIndicatorPositions: scoredTiles.map((tile) => tile.position),
    relatedTiles,
  };
}

export function getMaxScoreInfo(scoreInfos: ScoreInfo[]): ScoreInfo | undefined {
  const flatScores: number[] = scoreInfos.map((scoreInfo) => scoreInfo.score);
  const maxScore = Math.max(...flatScores, 0);
  const maxScoreIndex = flatScores.indexOf(maxScore);

  return scoreInfos[maxScoreIndex];
}

export function getFallbackScoreInfo(goalCategory: GoalCategory): ScoreInfo {
  return {
    goalCategory,
    scoreType: 'tile',
    scorePerEntity: 0,
    score: 0,
    scoredTiles: [],
    scoreIndicatorPositions: [],
  };
}
