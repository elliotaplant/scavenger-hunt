import { Handler } from '@netlify/functions';

function locationOnlyPrompt(location) {
  return `Act as a scavenger hunt clue generator. 
Create rhyming riddle clues to indicate where the next clue is located. 
Your response should have four short lines.
Do not include words from the Location in the riddle.

Location: ${location}`;
}

function locationAndContextPrompt(location, context) {
  return `Act as a scavenger hunt clue generator. 
Create rhyming riddle clues to indicate where the next clue is located. 
Your response should have four short lines. 
Do not include words from the Location in the riddle.
Include the context in the riddle if possible. 

Location: ${location}

Context: ${context}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const locationParam = event.queryStringParameters?.location;
  const contextParam = event.queryStringParameters?.context;

  if (!locationParam) {
    return { statusCode: 400, body: "Missing required 'location' parameter" };
  }

  const prompt = contextParam
    ? locationAndContextPrompt(locationParam, contextParam)
    : locationOnlyPrompt(locationParam);

  console.log('prompt', prompt);

  const clue = await Promise.race([getCompletion(prompt), timeoutTimer(8000)]);

  return { statusCode: 200, body: JSON.stringify({ clue }) };
};

async function getCompletion(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
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

async function timeoutTimer(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return 'Timeout';
}
