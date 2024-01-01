import { Coordinates } from '../models/simple-types';
import { BoardTile } from '../models/board-tile';
import { LandscapeType } from '../models/landscape-type';

export const BOARD_SIZE = 11;

const MOUNTAIN_COORDINATES: Coordinates[] = [
  { x: 1, y: 1 },
  { x: 3, y: 5 },
  { x: 5, y: 9 },
  { x: 8, y: 3 },
  { x: 9, y: 8 },
];

function isMountainTile(tile: Coordinates): boolean {
  return MOUNTAIN_COORDINATES.some((mountainTile) => mountainTile.x === tile.x && mountainTile.y === tile.y);
}

export function getInitialBoardTiles(): BoardTile[][] {
  const initialBoardTiles: BoardTile[][] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    let column: BoardTile[] = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
      const tile: BoardTile = { position: { x, y }, isBase: true };

      if (isMountainTile(tile.position)) {
        tile.landscape = LandscapeType.MOUNTAIN;
      }

      column.push(tile);
    }

    initialBoardTiles.push(column);
  }

  return initialBoardTiles;
}
