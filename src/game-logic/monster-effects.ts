import { MonsterType } from '../models/monster';
import { BoardTile, copyBoard } from '../models/board-tile';
import { getAdjacentTiles, isTileOfLandscape } from './functions';
import { LandscapeType } from '../models/landscape-type';
import { SpecialMove } from '../models/move';
import { Coordinates } from '../models/simple-types';

export interface MonsterEffect {
  name: string;
  description: string;
  getMonsterMove: (board: BoardTile[][]) => SpecialMove | undefined;
  applySpecialEffect: (board: BoardTile[][], move: SpecialMove) => BoardTile[][];
  isEndOfSeasonEffect?: boolean;
  isPlacingEffect?: boolean;
}

export function getSeasonEndMonsterEffect(board: BoardTile[][], monsterType: MonsterType | undefined): SpecialMove | undefined {
  const monsterEffect = monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  return monsterEffect?.isEndOfSeasonEffect ? monsterEffect.getMonsterMove(board) : undefined;
}

export function getPlacingMonsterEffect(board: BoardTile[][], monsterType: MonsterType | undefined): SpecialMove | undefined {
  const monsterEffect = monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  return monsterEffect?.isPlacingEffect ? monsterEffect.getMonsterMove(board) : undefined;
}

export function applyMonsterEffect(board: BoardTile[][], move: SpecialMove): BoardTile[][] {
  if (!move.monsterType) {
    return board;
  }

  const monsterEffect = MONSTER_EFFECTS[move.monsterType];
  return monsterEffect.applySpecialEffect(board, move);
}

export const MONSTER_EFFECTS: Record<MonsterType, MonsterEffect> = {
  [MonsterType.DRAGON]: {
    name: 'Dragon',
    description: 'Get 3 coins when the dragon is defeated (no malus anymore).',
    getMonsterMove: (_board: BoardTile[][]) => {
      return undefined;
    },
    applySpecialEffect: (board: BoardTile[][], _move: SpecialMove) => {
      return board;
    },
  },
  [MonsterType.TROLL]: {
    name: 'Troll',
    description: 'Destroys 1 adjacent empty landscape tile after each scoring.',
    isEndOfSeasonEffect: true,
    getMonsterMove: (board: BoardTile[][]) => {
      const trollTiles = board
        .flat()
        .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.TROLL);
      for (const trollTile of trollTiles) {
        const adjacentTiles = getAdjacentTiles(board, trollTile.position);
        const emptyAdjacentTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, undefined));
        if (emptyAdjacentTiles.length) {
          const tileToDestroy = emptyAdjacentTiles[0];
          return {
            action: 'monster_effect',
            monsterType: MonsterType.TROLL,
            affectedTiles: [tileToDestroy.position],
          };
        }
      }

      return undefined;
    },
    applySpecialEffect: (board: BoardTile[][], move: SpecialMove) => {
      if (move.monsterType === MonsterType.TROLL) {
        const tileToDestroy = board[move.affectedTiles![0].x][move.affectedTiles![0].y];
        tileToDestroy.destroyed = true;
      }

      return copyBoard(board);
    },
  },
  [MonsterType.ZOMBIE]: {
    name: 'Zombie',
    description: 'Expands to each adjacent empty landscape tile after each scoring.',
    isEndOfSeasonEffect: true,
    getMonsterMove: (board: BoardTile[][]) => {
      const zombieTiles = board
        .flat()
        .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.ZOMBIE);

      if (!zombieTiles.length) {
        return undefined;
      }

      return {
        action: 'monster_effect',
        monsterType: MonsterType.ZOMBIE,
      };
    },
    applySpecialEffect: (board: BoardTile[][], move: SpecialMove) => {
      if (move.monsterType === MonsterType.ZOMBIE) {
        const zombieTiles = board
          .flat()
          .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.ZOMBIE);
        zombieTiles.forEach((tile) => {
          const adjacentTiles = getAdjacentTiles(board, tile.position);
          const emptyAdjacentTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, undefined));
          emptyAdjacentTiles.forEach((tile) => {
            tile.landscape = LandscapeType.MONSTER;
            tile.monsterType = MonsterType.ZOMBIE;

            if (tile.heroStar) {
              tile.destroyed = true;
            }
          });
        });
      }

      return copyBoard(board);
    },
  },
  [MonsterType.GORGON]: {
    name: 'Gorgon',
    description: 'Destroys 1 adjacent landscape tile when placed (except mountain).',
    isPlacingEffect: true,
    getMonsterMove: (board: BoardTile[][]) => {
      const gorgonTiles = board
        .flat()
        .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.GORGON);

      if (!gorgonTiles.length) {
        return undefined;
      }

      let affectedTiles: Coordinates[] = [];

      const emptyTilesNextToGorgon: BoardTile[] = [];
      for (const gorgonTile of gorgonTiles) {
        const adjacentTiles = getAdjacentTiles(board, gorgonTile.position);
        const landscapeAdjacentTiles = adjacentTiles.filter(
          (tile) => tile.landscape && tile.landscape !== LandscapeType.MOUNTAIN && !tile.destroyed,
        );
        if (landscapeAdjacentTiles.length) {
          affectedTiles.push(landscapeAdjacentTiles[0].position);
          break;
        } else {
          const emptyAdjacentTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, undefined));
          emptyTilesNextToGorgon.push(...emptyAdjacentTiles);
        }
      }

      if (emptyTilesNextToGorgon.length) {
        affectedTiles.push(emptyTilesNextToGorgon[0].position);
      }

      return affectedTiles.length ? { action: 'monster_effect', monsterType: MonsterType.GORGON, affectedTiles } : undefined;
    },
    applySpecialEffect: (board: BoardTile[][], move: SpecialMove) => {
      if (move.monsterType === MonsterType.GORGON) {
        const tileToDestroy = board[move.affectedTiles![0].x][move.affectedTiles![0].y];
        tileToDestroy.destroyed = true;

        return copyBoard(board);
      }

      return board;
    },
  },
};
