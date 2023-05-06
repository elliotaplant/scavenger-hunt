import { Field, withTypes } from 'react-final-form';
import { ClueState, Clue } from './Clue';
import { useLocalStorage } from './hooks/useLocalStorage';

interface ClueStateWithId extends ClueState {
  id: number;
}

export interface HuntConfigState {
  targetAge?: string;
  theme?: string;
}

const { Form } = withTypes<HuntConfigState>();

export function App() {
  const [huntConfig, setHuntConfig] = useLocalStorage<HuntConfigState>('hunt-theme', {});

  const [clues, setClues] = useLocalStorage<ClueStateWithId[]>('clue-state', [{ id: 1 }]);

  const addClue = () => setClues([...clues, { id: Math.random() * 1e18 }]);

  const updateClue = (id: number, updatedClue: ClueState, huntConfig: HuntConfigState) => {
    setClues((clues) => clues.map((clue) => (clue.id === id ? { id, ...updatedClue } : clue)));
    setHuntConfig(huntConfig);
  };

  const deleteClue = (clueId: number, huntConfig: HuntConfigState) => {
    setClues((clues) => clues.filter((clue) => clue.id !== clueId));
    setHuntConfig(huntConfig);
  };

  return (
    <main>
      <h1 style={{ textAlign: 'center' }}>AI Scavenger Hunt Generator</h1>
      <hr />
      <Form
        onSubmit={console.log}
        initialValues={huntConfig}
        render={({ values }) => (
          <>
            <section style={{ marginBottom: '2rem' }}>
              <form>
                <label htmlFor="targetAge">Target Age (optional)</label>
                <Field name="targetAge" type="text" component="input" placeholder="12" />
                <br />
                <label htmlFor="theme">Theme (optional)</label>
                <Field name="theme" type="text" component="input" placeholder="pirate" />
              </form>
            </section>
            {clues.map((clue) => (
              <Clue
                key={clue.id}
                onDelete={() => deleteClue(clue.id, values)}
                onUpdate={(updatedClue) => updateClue(clue.id, updatedClue, values)}
                initialValues={clue}
                huntConfig={values}
              />
            ))}
          </>
        )}
      />
      <br />
      <section>
        <button type="button" onClick={addClue}>
          Add Clue
        </button>
      </section>
    </main>
  );
}
