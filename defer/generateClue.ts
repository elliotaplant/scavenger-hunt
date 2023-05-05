// the `defer()` helper will be used to define a background function
import { defer } from '@defer/client';
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

function locationOnlyPrompt(location: string) {
  return `Act as a scavenger hunt clue generator. 
Create rhyming riddle clues to indicate where the next clue is located. 
Your response should have four short lines.
Do not include words from the Location in the riddle.

Location: ${location}`;
}

function locationAndContextPrompt(location: string, context: string) {
  return `Act as a scavenger hunt clue generator. 
Create rhyming riddle clues to indicate where the next clue is located. 
Your response should have four short lines. 
Do not include words from the Location in the riddle.
Include the context in the riddle if possible. 

Location: ${location}

Context: ${context}`;
}

async function getCompletion(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      n: 1,
      stop: null,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const clue = data?.choices?.at(0)?.message?.content?.trim();
  return clue;
}

// a background function must be `async`
async function generateClue(clueId: string, location: string, context: string | undefined) {
  const prefixedKey = [process.env.REDIS_PREFIX, clueId].join(':');
  redis.set(prefixedKey, 'pending');

  const prompt = context
    ? locationAndContextPrompt(location, context)
    : locationOnlyPrompt(location);

  console.log('prompt', prompt);

  const clue = await getCompletion(prompt);
  console.log('clue', clue);

  await redis.set(prefixedKey, clue, 'EX', 86400);
  console.log('Set redis', { prefixedKey });
}

// the function must be wrapped with `defer()` and exported as default
export default defer(generateClue);
