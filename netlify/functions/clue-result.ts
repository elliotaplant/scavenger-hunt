import { Handler } from '@netlify/functions';
import Redis from 'ioredis';

const redisUrl: string | undefined = process.env.REDIS_URL;
const redisPrefix: string | undefined = process.env.REDIS_PREFIX;
if (!redisUrl) {
  throw new Error('Missing required REDIS_URL in env');
}
if (!redisPrefix) {
  throw new Error('Missing required REDIS_PREFIX in env');
}
const redis = new Redis(redisUrl);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const clueId = event.queryStringParameters?.clueId;

  if (!clueId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required 'location' parameter" }),
    };
  }

  const prefixedKey = [redisPrefix, clueId].join(':');
  const result = await redis.get(prefixedKey);

  if (result === null) {
    return { statusCode: 404, body: JSON.stringify({ error: `Clue not found with id ${clueId}` }) };
  }

  if (result === 'pending') {
    return { statusCode: 200, body: JSON.stringify({ clue: null, ready: false }) };
  }

  return { statusCode: 200, body: JSON.stringify({ clue: result, ready: true }) };
};
