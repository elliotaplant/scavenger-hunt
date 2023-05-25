import { defer } from '@defer/client';
import { getCompletion } from '../worker/getCompletion';

const testOpenai = async () => {
  try {
    const prompt = `Act as a scavenger hunt clue generator. 
Create a rhyming riddle to clearly indicate where the next clue is located. 
Your response should have four short lines.
Do not include words from the Location in the riddle.
The riddle should be written for an 8 year old

Next Clue Location: 'under the bridge'
  `.trim();

    console.log('prompt', prompt);

    const clue = await getCompletion(prompt);
    console.log('clue', clue);
  } catch (error) {
    throw error;
  }
};

export default defer(testOpenai);
