import { Clue, ClueState } from './Clue';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ClueStateWithId extends ClueState {
  id: number;
}

export function Main() {
  const [clues, setClues] = useLocalStorage<ClueStateWithId[]>('clue-state', [{ id: 1 }]);
  const addClue = () => setClues([...clues, { id: Math.random() * 1e18 }]);
  const updateClue = (id: number, updatedClue: ClueState) =>
    setClues((clues) => clues.map((clue) => (clue.id === id ? { id, ...updatedClue } : clue)));
  const deleteClue = (clueId: number) =>
    setClues((clues) => clues.filter((clue) => clue.id !== clueId));

  return (
    <main>
      <hr />
      {clues.map((clue) => (
        <Clue
          key={clue.id}
          onDelete={() => deleteClue(clue.id)}
          onUpdate={(updatedClue) => updateClue(clue.id, updatedClue)}
          initialValues={clue}
        />
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
