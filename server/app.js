const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

app.get('/generate-clue', async (req, res) => {
  try {
    const { location, context, theme, targetAge } = req.query;

    if (!location) {
      throw new Error('Location is required');
    }

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
    const clue = data?.choices?.[0]?.message?.content?.trim();
    if (!clue) {
      throw new Error('Unable to find clue');
    }

    res.status(200).json({ clue });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
