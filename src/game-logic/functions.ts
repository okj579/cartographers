import { BoardTile } from '../models/board-tile';
import { PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  hasConflict: boolean;
}

export function tryPlaceShapeOnBoard(board: BoardTile[][], shape?: PlacedLandscapeShape): PlaceShapeResult {
  const updatedBoard: BoardTile[][] = board.map((row) => row.map((tile) => ({ ...tile })));
  let hasConflict: boolean = false;

  if (!shape) return { updatedBoard, hasConflict };

  for (let cell of shape.baseShape.filledCells) {
    const tile = updatedBoard[shape.position.x + cell.x][shape.position.y + cell.y];

    if (tile) {
      applyShapeToTile(tile, shape);
    } else {
      hasConflict = true;
    }

    if (tile.conflicted) {
      hasConflict = true;
    }
  }

  return { updatedBoard, hasConflict };
}

function applyShapeToTile(tile: BoardTile, shape: PlacedLandscapeShape): BoardTile {
  const isHeroShape = shape.type === LandscapeType.HERO;
  const isHeroPosition =
    isHeroShape &&
    shape.heroPosition &&
    tile.position.x === shape.heroPosition.x + shape.position.x &&
    tile.position.y === shape.heroPosition.y + shape.position.y;
  const isHeroStar = isHeroShape && !isHeroPosition;

  const alreadyHasLandscape = tile.landscape !== undefined;

  console.warn('applyShapeToTile', tile.landscape, alreadyHasLandscape);

  if (alreadyHasLandscape && !isHeroShape && !isHeroStar) {
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
