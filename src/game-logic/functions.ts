import { BoardTile } from '../models/board-tile';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';
import { BaseShape } from '../models/base-shape';
import { Coordinates } from '../models/simple-types';
import { LANDSCAPE_CARDS, LandscapeCard } from '../models/landscape-card';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  conflictedCellIndices: number[];
}

export function rotateShapeClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.height - cell.y - 1, y: cell.x }));

  return { width: shape.height, height: shape.width, filledCells };
}

export function rotateShapeCounterClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: cell.y, y: shape.width - cell.x - 1 }));

  return { width: shape.height, height: shape.width, filledCells };
}

export function mirrorShape(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.width - cell.x - 1, y: cell.y }));

  return { ...shape, filledCells };
}

export function getShuffledCards(): LandscapeCard[] {
  const cards = [...LANDSCAPE_CARDS];
  const shuffledCards: LandscapeCard[] = [];

  while (cards.length > 0) {
    const index = Math.floor(Math.random() * cards.length);
    shuffledCards.push(cards[index]);
    cards.splice(index, 1);
  }

  return shuffledCards;
}

export function getCurrentTimeProgress(playedCards: LandscapeCard[]): number {
  return playedCards.reduce((sum, card) => sum + card.timeValue, 0);
}

export function tryPlaceShapeOnBoard(board: BoardTile[][], shape: PlacedLandscapeShape, isTemporary: boolean): PlaceShapeResult {
  const updatedBoard: BoardTile[][] = board.map((column) => column.map((tile) => ({ ...tile })));
  const conflictedCellIndices: number[] = [];

  if (!shape) return { updatedBoard, conflictedCellIndices };

  for (let i = 0; i < shape.baseShape.filledCells.length; i++) {
    let cell = shape.baseShape.filledCells[i];
    const column: BoardTile[] = updatedBoard[shape.position.x + cell.x];
    const tile = column ? column[shape.position.y + cell.y] : undefined;
    const { isHeroStar } = getHeroInformation(shape, cell);

    if (tile) {
      tile.isTemporary = isTemporary;
      applyShapeToTile(tile, shape, isHeroStar);
    } else if (!isHeroStar) {
      conflictedCellIndices.push(i);
    }

    if (tile?.conflicted) {
      conflictedCellIndices.push(i);
    }
  }

  return { updatedBoard, conflictedCellIndices };
}

function applyShapeToTile(tile: BoardTile, shape: PlacedLandscapeShape, isHeroStar: boolean): BoardTile {
  const alreadyHasLandscape = tile.landscape !== undefined;

  if (alreadyHasLandscape && !isHeroStar) {
    tile.conflicted = true;
  }

  tile.landscape = isHeroStar ? tile.landscape : shape.type;
  tile.heroStar = isHeroStar || tile.heroStar;

  if (tile.landscape === LandscapeType.MONSTER && tile.heroStar) {
    tile.destroyed = true;
  }

  return tile;
}

export function getHeroInformation(shape: LandscapeShape, cell: Coordinates) {
  const isHeroShape = shape.type === LandscapeType.HERO;
  const isHeroPosition = isHeroShape && shape.heroPosition && cell.x === shape.heroPosition.x && cell.y === shape.heroPosition.y;
  const isHeroStar = isHeroShape && !isHeroPosition;

  return { isHeroShape, isHeroStar };
}
