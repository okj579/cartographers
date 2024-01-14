import { kv } from '@vercel/kv';
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';
import { getGameId } from '../../../utils/general-util';
import { GameState } from '../../../models/game-state';

export default defineEventHandler(async (event): Promise<GameState> => {
  const body: GameState = await readBody(event);
  const gameId = getRouterParam(event, 'game');
  if (!gameId) throw createError({ statusCode: 400, message: 'No game id provided' });
  await kv.set(getGameId(gameId), body);

  return body;
});
