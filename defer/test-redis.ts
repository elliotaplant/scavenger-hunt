import { defer } from '@defer/client';
import Redis from 'ioredis';

const { REDIS_URL, REDIS_PREFIX } = process.env;

if (!REDIS_URL || !REDIS_PREFIX) {
  throw new Error('Missing REDIS_URL or REDIS_PREFIX in env');
}

const testRedis = async () => {
  const prefixedKey = [process.env.REDIS_PREFIX, 'hello-world'].join(':');
  const connection = new Redis(REDIS_URL);
  await connection.set(prefixedKey, Math.random() * 1e18, 'EX', 86400);
};

export default defer(testRedis);
