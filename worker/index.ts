import Bull from 'bull';
import { getCompletion } from './getCompletion';

export interface GenerateClueRequest {
  clueId: string;
  location: string;
  targetAge?: string;
  context?: string;
  theme?: string;
}

const { REDIS_URL, BULL_QUEUE_NAME, REDIS_PREFIX } = process.env;

if (!REDIS_URL || !BULL_QUEUE_NAME || !REDIS_PREFIX) {
  throw new Error('Missing REDIS_URL or BULL_QUEUE_NAME or REDIS_PREFIX in env');
}

console.log('Creating queue', { BULL_QUEUE_NAME });
const queue = new Bull<GenerateClueRequest>(BULL_QUEUE_NAME, REDIS_URL);

queue.process(async (job) => {
  const { clueId, location, theme, targetAge, context } = job.data;
  const redis = queue.client;
  const prefixedKey = [process.env.REDIS_PREFIX, clueId].join(':');
  redis.set(prefixedKey, 'pending');

  const prompt = `Act as a scavenger hunt clue generator. 
Create a ${
    theme ? 'Themed ' : ''
  }rhyming riddle to clearly indicate where the next clue is located. 
Your response should have four short lines.
Do not include words from the Location in the riddle.
${context ? 'Include the context in the riddle if possible.' : ''}
${targetAge ? `The riddle should be written for a ${targetAge} year old.` : ''}

Next Clue Location: ${location}

${context ? `Context: ${context}` : ''}

${theme ? `Theme: ${theme}` : ''}
`.trim();

  console.log('prompt', prompt);

  const clue = await getCompletion(prompt);
  console.log('clue', clue);

  await redis.set(prefixedKey, clue, 'EX', 86400);
  console.log('Set redis', { prefixedKey });
});

console.log('Listening for jobs in queue', { BULL_QUEUE_NAME });
