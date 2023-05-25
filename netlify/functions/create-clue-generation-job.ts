import { Handler } from '@netlify/functions';
import Redis from 'ioredis';
import generateClue from '../../defer/generate-clue';

const { REDIS_URL, BULL_QUEUE_NAME, REDIS_PREFIX } = process.env;

if (!REDIS_URL || !BULL_QUEUE_NAME || !REDIS_PREFIX) {
  throw new Error('Missing REDIS_URL or BULL_QUEUE_NAME or REDIS_PREFIX in env');
}
const connection = new Redis(REDIS_URL);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { location, context, theme, targetAge } = event.queryStringParameters || {};

  if (!location) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing location parameter' }) };
  }

  const clueId = String(Math.random() * 1e18);

  const prefixedKey = [REDIS_PREFIX, clueId].join(':');
  await connection.set(prefixedKey, 'pending', 'EX', 86400);
  await generateClue({ clueId, location, context, theme, targetAge });
  return { statusCode: 201, body: JSON.stringify({ clueId }) };
};
