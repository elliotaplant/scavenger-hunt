import { Handler } from '@netlify/functions';
import helloWorld from '../../defer/helloWorld';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const resp = await helloWorld('Elliot');

  return { statusCode: 202, body: JSON.stringify({ executionId: resp.id }) };
};
