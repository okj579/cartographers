import { BoardTile } from './board-tile';
import { LandscapeType } from './landscape-type';
import { BOARD_SIZE } from '../game-logic/constants';

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
          if (boardState[x][y].landscape === LandscapeType.FOREST) {
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
          if (boardState[x][y].landscape === LandscapeType.WATER) {
            waterTiles++;
          } else if (boardState[x][y].landscape === LandscapeType.FIELD) {
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
          if (boardState[x][y].landscape !== undefined) {
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

interface LandscapeArea {
  landscape: LandscapeType;
  tiles: BoardTile[];
}

// group all tiles of the same landscape type that are directly connected via edges
function getIndividualAreas(boardState: BoardTile[][], landscapeType: LandscapeType): LandscapeArea[] {
  const connectedAreas: LandscapeArea[] = [];
  const visitedTiles: BoardTile[] = [];
  const tilesToVisit: BoardTile[] = [];
  const boardSize = BOARD_SIZE;

  // iterate over all tiles
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const tile = boardState[x][y];
      // if tile is of the landscape type and not yet visited
      if (tile.landscape === landscapeType && !visitedTiles.includes(tile)) {
        // add tile to tiles to visit
        tilesToVisit.push(tile);
        // create new area
        const area: LandscapeArea = {
          landscape: landscapeType,
          tiles: [],
        };
        // add tile to area
        area.tiles.push(tile);
        // add area to connected areas
        connectedAreas.push(area);
        // while there are tiles to visit
        while (tilesToVisit.length > 0) {
          // get first tile to visit
          const tileToVisit = tilesToVisit.shift();

          if (!tileToVisit) continue;

          // if tile is not yet visited
          if (!visitedTiles.includes(tileToVisit)) {
            // add tile to visited tiles
            visitedTiles.push(tileToVisit);
            // add tile to area
            area.tiles.push(tileToVisit);
            // get all adjacent tiles
            const adjacentTiles = [
              boardState[tileToVisit.position.x - 1]?.[tileToVisit.position.y],
              boardState[tileToVisit.position.x + 1]?.[tileToVisit.position.y],
              boardState[tileToVisit.position.x]?.[tileToVisit.position.y - 1],
              boardState[tileToVisit.position.x]?.[tileToVisit.position.y + 1],
            ];
            // add adjacent tiles that are of the landscape type and not yet visited to tiles to visit
            adjacentTiles.forEach((adjacentTile) => {
              if (adjacentTile?.landscape === landscapeType && !visitedTiles.includes(adjacentTile)) {
                tilesToVisit.push(adjacentTile);
              }
            });
          }
        }
      }
    }
  }

  return connectedAreas;
}
