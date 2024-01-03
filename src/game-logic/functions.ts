import { BoardTile } from '../models/board-tile';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';
import { BaseShape } from '../models/base-shape';
import { Coordinates } from '../models/simple-types';
import { LANDSCAPE_CARDS, LandscapeCard } from '../models/landscape-card';
import { Season } from '../models/season';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  conflictedCellIndices: number[];
  newCoins: number;
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

export function getSeasonScore(season: Season, scores: number[], coins: number): number {
  return coins + season.goalIndices.reduce((acc: number, index: number): number => acc + (scores[index] ?? 0), 0);
}

export function tryPlaceShapeOnBoard(board: BoardTile[][], shape: PlacedLandscapeShape, isTemporary: boolean): PlaceShapeResult {
  const updatedBoard: BoardTile[][] = board.map((column) => column.map((tile) => ({ ...tile })));
  const conflictedCellIndices: number[] = [];
  let newCoins = 0;

  if (!shape) return { updatedBoard, conflictedCellIndices, newCoins };

  for (let i = 0; i < shape.baseShape.filledCells.length; i++) {
    let cell = shape.baseShape.filledCells[i];
    const column: BoardTile[] = updatedBoard[shape.position.x + cell.x];
    const tile = column ? column[shape.position.y + cell.y] : undefined;
    const { isHeroStar } = getHeroInformation(shape, cell);

    if (tile) {
      tile.isTemporary = isTemporary;
      applyShapeToTile(tile, shape, isHeroStar);
      newCoins += checkForMountainCoin(updatedBoard, tile.position);
    } else if (!isHeroStar) {
      conflictedCellIndices.push(i);
    }

    if (tile?.conflicted) {
      conflictedCellIndices.push(i);
    }
  }

  return { updatedBoard, conflictedCellIndices, newCoins };
}

function checkForMountainCoin(board: BoardTile[][], cell: Coordinates): number {
  const adjacentTiles = getAdjacentTiles(board, cell);
  const mountainTiles = adjacentTiles.filter((tile) => tile.landscape === LandscapeType.MOUNTAIN);
  let coins = 0;

  for (let mountainTile of mountainTiles) {
    if (!mountainTile.hasCoin) continue;

    let adjacentMountainTiles = getAdjacentTiles(board, mountainTile.position);
    let isMountainSurrounded = adjacentMountainTiles.every((tile) => tile.landscape !== undefined);

    if (isMountainSurrounded) {
      mountainTile.hasCoin = false;
      coins++;
    }
  }

  return coins;
}

function getAdjacentTiles(board: BoardTile[][], cell: Coordinates): BoardTile[] {
  const adjacentTiles: BoardTile[] = [];

  if (cell.x > 0) adjacentTiles.push(board[cell.x - 1][cell.y]);
  if (cell.x < board.length - 1) adjacentTiles.push(board[cell.x + 1][cell.y]);
  if (cell.y > 0) adjacentTiles.push(board[cell.x][cell.y - 1]);
  if (cell.y < board.length - 1) adjacentTiles.push(board[cell.x][cell.y + 1]);

  return adjacentTiles;
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
