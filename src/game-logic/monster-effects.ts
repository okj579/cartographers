import { MonsterType } from '../models/monster';
import { BoardTile, copyBoard } from '../models/board-tile';
import { getAdjacentTiles, isTileOfLandscape } from './functions';
import { LandscapeType } from '../models/landscape-type';

export interface MonsterEffect {
  name: string;
  description: string;
  effect: (board: BoardTile[][]) => BoardTile[][];
  isEndOfSeasonEffect?: boolean;
  isPlacingEffect?: boolean;
}

export function applySeasonEndMonsterEffect(board: BoardTile[][], monsterType: MonsterType | undefined): BoardTile[][] {
  const monsterEffect = monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  return monsterEffect?.isEndOfSeasonEffect ? monsterEffect.effect(board) : board;
}

export function applyPlacingMonsterEffect(board: BoardTile[][], monsterType: MonsterType | undefined): BoardTile[][] {
  const monsterEffect = monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  return monsterEffect?.isPlacingEffect ? monsterEffect.effect(board) : board;
}

export const MONSTER_EFFECTS: Record<MonsterType, MonsterEffect> = {
  [MonsterType.DRAGON]: {
    name: 'Dragon',
    description: 'Get 3 coins when the dragon is defeated (no malus anymore).',
    effect: (board: BoardTile[][]) => {
      return board;
    },
  },
  [MonsterType.TROLL]: {
    name: 'Troll',
    description: 'Destroys 1 adjacent empty landscape tile after each scoring.',
    isEndOfSeasonEffect: true,
    effect: (board: BoardTile[][]) => {
      const trollTiles = board
        .flat()
        .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.TROLL);
      for (const trollTile of trollTiles) {
        const adjacentTiles = getAdjacentTiles(board, trollTile.position);
        const emptyAdjacentTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, undefined));
        if (emptyAdjacentTiles.length) {
          const tileToDestroy = emptyAdjacentTiles[0];
          tileToDestroy.destroyed = true;
          return copyBoard(board);
        }
      }

      return board;
    },
  },
  [MonsterType.ZOMBIE]: {
    name: 'Zombie',
    description: 'Expands to each adjacent empty landscape tile after each scoring.',
    isEndOfSeasonEffect: true,
    effect: (board: BoardTile[][]) => {
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

      return copyBoard(board);
    },
  },
  [MonsterType.GORGON]: {
    name: 'Gorgon',
    description: 'Destroys 1 adjacent landscape tile when placed (except mountain).',
    isPlacingEffect: true,
    effect: (board: BoardTile[][]) => {
      const gorgonTiles = board
        .flat()
        .filter((tile) => isTileOfLandscape(tile, LandscapeType.MONSTER) && tile.monsterType === MonsterType.GORGON);
      for (const gorgonTile of gorgonTiles) {
        const adjacentTiles = getAdjacentTiles(board, gorgonTile.position);
        const landscapeAdjacentTiles = adjacentTiles.filter(
          (tile) => tile.landscape && tile.landscape !== LandscapeType.MOUNTAIN && !tile.destroyed,
        );
        if (landscapeAdjacentTiles.length) {
          const tileToDestroy = landscapeAdjacentTiles[0];
          tileToDestroy.destroyed = true;
          return copyBoard(board);
        } else {
          const emptyAdjacentTiles = adjacentTiles.filter((tile) => isTileOfLandscape(tile, undefined));
          if (emptyAdjacentTiles.length) {
            const tileToDestroy = emptyAdjacentTiles[0];
            tileToDestroy.destroyed = true;
            return copyBoard(board);
          }
        }
      }

      return board;
    },
  },
};
