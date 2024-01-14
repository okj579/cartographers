import { kv } from '@vercel/kv';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event): Promise<string[]> => {
  return kv.keys('game.*').then((keys) => keys.map((key) => key.replace('game.', '')));
});
