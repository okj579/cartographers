import { kv } from '@vercel/kv';
import { createError, defineEventHandler, getRouterParam } from 'h3';
import { getGameId } from '../../../utils/general-util';
import { GameState } from '../../../models/game-state';
import { COIN_GOAL, MONSTER_GOAL } from '../../../models/goals';

export default defineEventHandler(async (event): Promise<GameState> => {
  const gameId = getRouterParam(event, 'game');
  if (!gameId) throw createError({ statusCode: 400, message: 'No game id provided' });
  const gameState: GameState | null = await kv.get(getGameId(gameId));
  if (!gameState) throw createError({ statusCode: 404, message: 'Game not found' });

  if (gameState.goals.length === 4) {
    gameState.goals.push(COIN_GOAL, MONSTER_GOAL); // migrate old games to new goals
  }

  return gameState;
});
