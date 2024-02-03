import { Coordinates } from './simple-types';
import { BOARD_SIZE } from '../game-logic/constants';
import { MonsterType } from './monster';

export const initialMove: Move = {
  selectedShapeIndex: 0,
  selectedLandscapeIndex: 0,
  position: { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) - 1 },
  numberOfClockwiseRotations: 0,
  numberOfCounterClockwiseRotations: 0,
  isFlipped: false,
};

export interface Move {
  readonly selectedShapeIndex: number;
  readonly selectedLandscapeIndex: number;
  readonly position: Coordinates;
  readonly numberOfClockwiseRotations: number;
  readonly numberOfCounterClockwiseRotations: number;
  readonly isFlipped: boolean;
}

export interface SpecialMove {
  action: 'change_of_season' | 'monster_effect';
  monsterType?: MonsterType;
  affectedTiles?: Coordinates[];
}

export type AnyMove = Move | SpecialMove;

export function isSpecialMove(move: AnyMove): move is SpecialMove {
  return (move as SpecialMove).action !== undefined;
}

export function isRegularMove(move: AnyMove): move is Move {
  return !isSpecialMove(move);
}

export function isSeasonChange(move: AnyMove): boolean {
  return isSpecialMove(move) && move.action === 'change_of_season';
}

export function normalizeRotations(move: Move): Move {
  const numberOfClockwiseRotations = move.numberOfClockwiseRotations % 4;
  const numberOfCounterClockwiseRotations = move.numberOfCounterClockwiseRotations % 4;

  const numberOfRotations = (numberOfClockwiseRotations + 4 - numberOfCounterClockwiseRotations) % 4;

  return {
    ...move,
    numberOfClockwiseRotations: numberOfRotations,
    numberOfCounterClockwiseRotations: 0,
  };
}
