import { BoardTile } from '../models/board-tile';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';
import { BaseShape } from '../models/base-shape';
import { Coordinates } from '../models/simple-types';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  hasConflict: boolean;
}

export function rotateShape(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.height - cell.y - 1, y: cell.x }));

  return { width: shape.height, height: shape.width, filledCells };
}

export function mirrorShape(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.width - cell.x - 1, y: cell.y }));

  return { ...shape, filledCells };
}

export function tryPlaceShapeOnBoard(board: BoardTile[][], shape: PlacedLandscapeShape, isTemporary: boolean): PlaceShapeResult {
  const updatedBoard: BoardTile[][] = board.map((row) => row.map((tile) => ({ ...tile })));
  let hasConflict: boolean = false;

  if (!shape) return { updatedBoard, hasConflict };

  for (let cell of shape.baseShape.filledCells) {
    const tile = updatedBoard[shape.position.x + cell.x][shape.position.y + cell.y];

    if (tile) {
      tile.isTemporary = isTemporary;
      applyShapeToTile(tile, shape);
    } else {
      hasConflict = true;
    }

    if (tile?.conflicted) {
      hasConflict = true;
    }
  }

  return { updatedBoard, hasConflict };
}

function applyShapeToTile(tile: BoardTile, shape: PlacedLandscapeShape): BoardTile {
  const { isHeroStar } = getHeroInformation(shape, tile.position, shape.position);

  const alreadyHasLandscape = tile.landscape !== undefined;

  if (alreadyHasLandscape && !isHeroStar) {
    tile.conflicted = true;

    return tile;
  }

  tile.landscape = isHeroStar ? tile.landscape : shape.type;
  tile.heroStar = isHeroStar || tile.heroStar;

  if (tile.landscape === LandscapeType.MONSTER && tile.heroStar) {
    tile.destroyed = true;
  }

  return tile;
}

export function getHeroInformation(shape: LandscapeShape, cell: Coordinates, offset: Coordinates = { x: 0, y: 0 }) {
  const isHeroShape = shape.type === LandscapeType.HERO;
  const isHeroPosition =
    isHeroShape && shape.heroPosition && cell.x === shape.heroPosition.x + offset.x && cell.y === shape.heroPosition.y + offset.y;
  const isHeroStar = isHeroShape && !isHeroPosition;

  return { isHeroShape, isHeroStar };
}
