import { kv } from '@vercel/kv';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (e) => {
    await kv.incr('testcounter');
    const testcounter = await kv.get('testcounter');
    return { testcounter };
})