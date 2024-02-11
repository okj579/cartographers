import { BoardTile, copyBoard, tilesToCoordinates } from '../models/board-tile';
import { LandscapeShape, PlacedLandscapeShape } from '../models/landscape-shape';
import { LandscapeType } from '../models/landscape-type';
import { areShapesEqual, BaseShape, copyShape } from '../models/base-shape';
import { Coordinates, includesCoordinates } from '../models/simple-types';
import { copyLandscapeCard, LandscapeCard } from '../models/landscape-card';
import { Season } from '../models/season';
import { BOARD_SIZE } from './constants';
import { flipShape, rotateShapeClockwise } from './transformation-functions';
import { MonsterType } from '../models/monster';

interface PlaceShapeResult {
  updatedBoard: BoardTile[][];
  conflictedCellIndices: number[];
}

export interface FindPositionResult {
  position: Coordinates | undefined;
  updatedShape: BaseShape;
  numberOfRotations: number;
  isFlipped: boolean;
}

export interface LandscapeArea {
  landscape: LandscapeType | undefined;
  tiles: BoardTile[];
}

interface DragonFightStatus {
  defeatedTiles: BoardTile[];
  undefeatedTiles: BoardTile[];
  isDefeated: boolean;
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

export function getSeasonScore(season: Season, scores: number[]): number {
  return season.goalIndices.reduce((acc: number, index: number): number => acc + (scores[index] ?? 0), 0);
}

export function tryPlaceShapeOnBoard(board: BoardTile[][], shape: PlacedLandscapeShape | undefined): PlaceShapeResult {
  const updatedBoard: BoardTile[][] = copyBoard(board);
  const conflictedCellIndices: number[] = [];

  if (!shape) return { updatedBoard, conflictedCellIndices };

  let dragonFightStatus = isDragonDefeated(updatedBoard);

  for (let i = 0; i < shape.baseShape.filledCells.length; i++) {
    let cell = shape.baseShape.filledCells[i];
    const column: BoardTile[] = updatedBoard[shape.position.x + cell.x];
    const tile = column ? column[shape.position.y + cell.y] : undefined;
    const { isHeroStar } = getHeroInformation(shape, cell);

    if (tile) {
      tile.monsterType = isHeroStar ? tile.monsterType : shape.monsterType;
      applyShapeToTile(tile, shape, isHeroStar);

      if (!tile.conflicted) {
        // todo - check needed? + needed for monster move?
        checkForMountainCoin(updatedBoard, tile.position);

        if (i === 0 && shape.baseShape.hasCoin) {
          tile.wasScoreCoin = true;
        }
      }
      if (shape.monsterType === MonsterType.DRAGON && i === 0) {
        tile.hasCoin = true;
      }
    } else if (!isHeroStar) {
      conflictedCellIndices.push(i);
    }

    if (tile?.conflicted) {
      conflictedCellIndices.push(i);
    }
  }

  if (
    !dragonFightStatus.isDefeated &&
    !conflictedCellIndices.length &&
    (dragonFightStatus.undefeatedTiles.length > 0 || shape.monsterType === MonsterType.DRAGON)
  ) {
    handleDragonFight(dragonFightStatus, updatedBoard);
  }

  return {
    updatedBoard: copyBoard(updatedBoard),
    conflictedCellIndices,
  };
}

export function checkForMountainCoin(board: BoardTile[][], cell: Coordinates): void {
  const adjacentTiles = getAdjacentTiles(board, cell);
  const mountainTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, LandscapeType.MOUNTAIN));

  for (let mountainTile of mountainTiles) {
    if (!mountainTile.hasCoin) continue;

    let adjacentMountainTiles = getAdjacentTiles(board, mountainTile.position);
    let isMountainSurrounded = adjacentMountainTiles.every((tile) => isTileFilled(tile));

    mountainTile.hasCoin = !isMountainSurrounded;
    mountainTile.wasScoreCoin = isMountainSurrounded;
  }
}

export function isDragonDefeated(board: BoardTile[][]): DragonFightStatus {
  const dragonTiles = board.flat().filter((tile) => tile.landscape === LandscapeType.MONSTER && tile.monsterType === MonsterType.DRAGON);

  const defeatedTiles: BoardTile[] = dragonTiles.filter((dragonTile: BoardTile): boolean => {
    if (dragonTile.destroyed) return true;

    const adjacentTiles = getAdjacentTiles(board, dragonTile.position);
    return !adjacentTiles.some((tile) => isTileOfLandscape(tile, undefined));
  });

  const undefeatedTiles: BoardTile[] = dragonTiles.filter(
    (dragonTile: BoardTile): boolean => !includesCoordinates(dragonTile.position, tilesToCoordinates(defeatedTiles)),
  );

  return {
    defeatedTiles,
    undefeatedTiles,
    isDefeated: defeatedTiles.length > 0 && undefeatedTiles.length === 0,
  };
}

export function handleDragonFight(dragonFightStatus: DragonFightStatus, board: BoardTile[][]): void {
  const newDragonFightStatus = isDragonDefeated(board);
  if (newDragonFightStatus.isDefeated) {
    const coinTile = dragonFightStatus.undefeatedTiles.find((tile) => tile.hasCoin);

    if (coinTile) {
      coinTile.wasScoreCoin = true;
    }
  }

  console.debug('handleDragonFight', dragonFightStatus, newDragonFightStatus);

  dragonFightStatus = newDragonFightStatus;

  dragonFightStatus.defeatedTiles.forEach((tile) => {
    tile.hasCoin = false;
  });

  dragonFightStatus.undefeatedTiles.forEach((tile, index) => {
    tile.hasCoin = index === 0;
    tile.wasScoreCoin = false;
  });
}

export function getAdjacentTiles(board: BoardTile[][], cell: Coordinates): BoardTile[] {
  const adjacentTiles: BoardTile[] = [];

  if (cell.x > 0) adjacentTiles.push(board[cell.x - 1][cell.y]);
  if (cell.x < board.length - 1) adjacentTiles.push(board[cell.x + 1][cell.y]);
  if (cell.y > 0) adjacentTiles.push(board[cell.x][cell.y - 1]);
  if (cell.y < board.length - 1) adjacentTiles.push(board[cell.x][cell.y + 1]);

  return adjacentTiles;
}

function applyShapeToTile(tile: BoardTile, shape: PlacedLandscapeShape, isHeroStar: boolean): BoardTile {
  const alreadyHasLandscape = isTileFilled(tile);

  if (alreadyHasLandscape && !isHeroStar) {
    tile.conflicted = true;
  }

  tile.landscape = isHeroStar ? tile.landscape : shape.type;
  tile.heroStar = isHeroStar || tile.heroStar;

  if (isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.heroStar) {
    tile.destroyed = true;
  }

  return tile;
}

export function isOutOfBoard(cell: Coordinates): boolean {
  return cell.x < 0 || cell.y < 0 || cell.x >= BOARD_SIZE || cell.y >= BOARD_SIZE;
}

export function getHeroInformation(shape: LandscapeShape, cell: Coordinates) {
  const isHeroShape = shape.type === LandscapeType.HERO;
  const isHeroPosition = isHeroShape && shape.heroPosition && cell.x === shape.heroPosition.x && cell.y === shape.heroPosition.y;
  const isHeroStar = isHeroShape && !isHeroPosition;

  return { isHeroShape, isHeroStar };
}

export function findFirstPositionForShape(board: BoardTile[][], shape: BaseShape): FindPositionResult {
  let { position, updatedShape, numberOfRotations } = findFirstPositionForShapeWithAllRotations(board, shape);
  let isFlipped = false;

  if (!position) {
    updatedShape = flipShape(shape);
    isFlipped = true;

    if (!areShapesEqual(shape, updatedShape)) {
      let subResult = findFirstPositionForShapeWithAllRotations(board, updatedShape);
      position = subResult.position;
      updatedShape = subResult.updatedShape;
      numberOfRotations = subResult.numberOfRotations;
    }
  }

  return { position, updatedShape, numberOfRotations, isFlipped };
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

  return { position, updatedShape, numberOfRotations, isFlipped: false };
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

    if (isTileFilled(tile)) {
      return false;
    }
  }

  return true;
}

// group all tiles of the same landscape type that are directly connected via edges
export function getIndividualAreas(boardState: BoardTile[][], landscapeType: LandscapeType | undefined): LandscapeArea[] {
  const connectedAreas: LandscapeArea[] = [];
  const visitedTiles: BoardTile[] = [];
  const tilesToVisit: BoardTile[] = [];
  const boardSize = BOARD_SIZE;

  // iterate over all tiles
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const tile = boardState[x][y];
      // if tile is of the landscape type and not yet visited
      if (isTileOfLandscape(tile, landscapeType) && !visitedTiles.includes(tile)) {
        // add tile to tiles to visit
        tilesToVisit.push(tile);
        // create new area
        const area: LandscapeArea = {
          landscape: landscapeType,
          tiles: [],
        };
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
              if (adjacentTile && isTileOfLandscape(adjacentTile, landscapeType) && !visitedTiles.includes(adjacentTile)) {
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

export function isTileFilled(tile: BoardTile): boolean {
  return !isTileOfLandscape(tile, undefined);
}

export function isTileOfLandscape(tile: BoardTile, landscapeType: LandscapeType | undefined): boolean {
  return tile.landscape === landscapeType && !tile.destroyed;
}
