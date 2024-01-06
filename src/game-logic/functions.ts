import { BoardTile } from '../models/board-tile';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';
import { areShapesEqual, BaseShape, copyShape } from '../models/base-shape';
import { Coordinates } from '../models/simple-types';
import { copyLandscapeCard, LandscapeCard } from '../models/landscape-card';
import { Season } from '../models/season';
import { BOARD_SIZE } from './constants';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  conflictedCellIndices: number[];
  newCoins: number;
}

export interface FindPositionResult {
  position: Coordinates | undefined;
  updatedShape: BaseShape;
  numberOfRotations: number;
  isMirrored?: boolean;
}

interface LandscapeArea {
  landscape: LandscapeType;
  tiles: BoardTile[];
}

function rotateShapeClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.height - cell.y - 1, y: cell.x }));

  return { width: shape.height, height: shape.width, filledCells };
}

function rotateShapeCounterClockwise(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: cell.y, y: shape.width - cell.x - 1 }));

  return { width: shape.height, height: shape.width, filledCells };
}

function mirrorShape(shape: BaseShape): BaseShape {
  const filledCells: Coordinates[] = shape.filledCells.map((cell) => ({ x: shape.width - cell.x - 1, y: cell.y }));

  return { ...shape, filledCells };
}

export function rotateLandscapeShapeClockwise(shape: LandscapeShape): LandscapeShape {
  const baseShape = rotateShapeClockwise(shape.baseShape);
  const heroPosition = shape.heroPosition ? { x: baseShape.width - shape.heroPosition.y - 1, y: shape.heroPosition.x } : undefined;

  return { ...shape, baseShape, heroPosition };
}

export function rotateLandscapeShapeCounterClockwise(shape: LandscapeShape): LandscapeShape {
  const baseShape = rotateShapeCounterClockwise(shape.baseShape);
  const heroPosition = shape.heroPosition ? { x: shape.heroPosition.y, y: baseShape.height - shape.heroPosition.x - 1 } : undefined;

  return { ...shape, baseShape, heroPosition };
}

export function mirrorLandscapeShape(shape: LandscapeShape): LandscapeShape {
  const baseShape = mirrorShape(shape.baseShape);
  const heroPosition = shape.heroPosition ? { x: baseShape.width - shape.heroPosition.x - 1, y: shape.heroPosition.y } : undefined;

  return { ...shape, baseShape, heroPosition };
}

export function getShuffledCards(deck: LandscapeCard[]): LandscapeCard[] {
  const cards = [...deck];
  const shuffledCards: LandscapeCard[] = [];

  while (cards.length > 0) {
    const index = Math.floor(Math.random() * cards.length);
    shuffledCards.push(copyLandscapeCard(cards[index]));
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
      tile.monsterType = shape.monsterType;
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

export function findFirstPositionForShape(board: BoardTile[][], shape: BaseShape): FindPositionResult {
  let { position, updatedShape, numberOfRotations } = findFirstPositionForShapeWithAllRotations(board, shape);
  let isMirrored = false;

  if (!position) {
    updatedShape = mirrorShape(shape);
    isMirrored = true;

    if (!areShapesEqual(shape, updatedShape)) {
      let subResult = findFirstPositionForShapeWithAllRotations(board, updatedShape);
      position = subResult.position;
      updatedShape = subResult.updatedShape;
      numberOfRotations = subResult.numberOfRotations;
    }
  }

  return { position, updatedShape, numberOfRotations, isMirrored };
}

function findFirstPositionForShapeWithAllRotations(board: BoardTile[][], shape: BaseShape): FindPositionResult {
  let updatedShape = copyShape(shape);
  let previousShape = copyShape(shape);
  let numberOfRotations = 0;
  let position: Coordinates | undefined;

  position = getFirstAvailablePosition(board, updatedShape);

  while (!position && numberOfRotations < 3) {
    previousShape = copyShape(updatedShape);
    updatedShape = rotateShapeClockwise(updatedShape);
    numberOfRotations++;

    if (!areShapesEqual(previousShape, updatedShape)) {
      position = getFirstAvailablePosition(board, updatedShape);
    }
  }

  return { position, updatedShape, numberOfRotations };
}

function getFirstAvailablePosition(board: BoardTile[][], shape: BaseShape): Coordinates | undefined {
  const boardSize = BOARD_SIZE;

  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      if (canPlaceShapeOnBoard(board, shape, { x, y })) {
        return { x, y };
      }
    }
  }

  return undefined;
}

function canPlaceShapeOnBoard(board: BoardTile[][], shape: BaseShape, position: Coordinates): boolean {
  const boardSize = BOARD_SIZE;

  if (position.x < 0 || position.y < 0 || position.x + shape.width > boardSize || position.y + shape.height > boardSize) {
    return false;
  }

  for (let cell of shape.filledCells) {
    const tile = board[position.x + cell.x][position.y + cell.y];

    if (tile.landscape !== undefined) {
      return false;
    }
  }

  return true;
}

// group all tiles of the same landscape type that are directly connected via edges
export function getIndividualAreas(boardState: BoardTile[][], landscapeType: LandscapeType): LandscapeArea[] {
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
