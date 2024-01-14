import { kv } from '@vercel/kv';
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';
import { getGameId } from '../../../utils/general-util';
import { GameState, PlayerGameState } from '../../../models/game-state';
import { updatePlayerState } from '../../../game-logic/game-state-functions';

export default defineEventHandler(async (event): Promise<GameState> => {
  const playerState: PlayerGameState = await readBody(event);
  const gameId = getRouterParam(event, 'game');
  if (!gameId) throw createError({ statusCode: 400, message: 'No game id provided' });
  const currentGameState: GameState | null = await kv.get(getGameId(gameId));
  if (!currentGameState) throw createError({ statusCode: 404, message: 'Game not found' });
  const newGameState: GameState = updatePlayerState(currentGameState, playerState);
  await kv.set(getGameId(gameId), newGameState);

  return newGameState;
});
