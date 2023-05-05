import { Handler } from '@netlify/functions';
import generateClue from '../../defer/generateClue';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { location, context, theme, targetAge } = event.queryStringParameters || {};

  if (!location) {
    return { statusCode: 400, body: "Missing required 'location' parameter" };
  }

  const clueId = String(Math.random() * 1e18);

  await generateClue(clueId, { location, context, theme, targetAge });

  return { statusCode: 202, body: JSON.stringify({ clueId }) };
};
