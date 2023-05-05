import { useState } from 'react';
import { Clue } from './Clue';

export function Main() {
  const [clues, setClues] = useState([{ id: 1 }]);
  const addClue = () => setClues([...clues, { id: Math.random() * 1e18 }]);

  return (
    <main>
      <hr />

      {clues.map((clue) => (
        <Clue key={clue.id} />
      ))}
      <br />
      <section>
        <button type="button" onClick={addClue}>
          Add Clue
        </button>
      </section>
    </main>
  );
}
