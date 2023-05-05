import { Field, withTypes } from 'react-final-form';
import { required } from '../utils/form';
import { useState } from 'react';
import { FORM_ERROR } from 'final-form';
import { sleep } from '../utils/sleep';

export interface ClueState {
  location?: string;
  context?: string;
  result?: string;
}

interface ClueProps {
  onDelete: () => void;
  onUpdate: (clue: ClueState) => void;
  initialValues: ClueState;
}

interface ClueFormFields {
  location: string;
  context: string;
}

const { Form } = withTypes<ClueFormFields>();

export function Clue({ initialValues, onUpdate, onDelete }: ClueProps) {
  const [generating, setGenerating] = useState(false);
  // const [clueResult, setClueResult] = useState(initialValues.result);

  const generateClue = async ({ location, context }: ClueFormFields) => {
    setGenerating(true);
    onUpdate({ location, context });
    const search = new URLSearchParams();

    if (location) {
      search.append('location', location);
    } else {
      alert('Location is required');
      return;
    }

    if (context) {
      search.append('context', context);
    }

    try {
      const response = await fetch('/.netlify/functions/generate-clue?' + search.toString());
      const { clueId } = await response.json();

      let clueResult: string | null = null;
      let gotResult = false;
      while (!gotResult) {
        const response = await fetch(`/.netlify/functions/clue-result?clueId=${clueId}`);
        const { clue, ready } = await response.json();
        if (ready) {
          clueResult = clue;
          gotResult = true;
        }
        await sleep(1000);
      }
      if (clueResult) {
        onUpdate({ location, context, result: clueResult });
      }
    } catch (error: any) {
      console.error(error);
      alert('Failed to generate clue');
      setGenerating(false);
      return { [FORM_ERROR]: error?.message };
    }
    setGenerating(false);
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <Form
        onSubmit={generateClue}
        initialValues={initialValues}
        render={({ handleSubmit, hasValidationErrors, submitError }) => (
          <form onSubmit={handleSubmit}>
            <label>Location</label>
            <Field
              name="location"
              placeholder="Behind the refrigerator"
              type="text"
              validate={required}
              size={20}
              disabled={generating}
              component="input"
            />

            <label>Context (optional)</label>
            <Field
              name="context"
              placeholder="The refrigerator makes weird noises"
              type="text"
              cols={40}
              rows={5}
              disabled={generating}
              component="textarea"
            />
            {initialValues.result && (
              <pre>
                <code>{initialValues.result}</code>
              </pre>
            )}
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <button
              name="generateButton"
              type="submit"
              disabled={generating || hasValidationErrors}
              style={{ marginRight: '1rem' }}
            >
              {initialValues.result ? 'Regenerate Clue' : 'Generate Clue'}
            </button>
            <button
              name="deleteButton"
              style={{ backgroundColor: 'transparent', color: 'red', borderColor: 'red' }}
              type="button"
              onClick={onDelete}
            >
              Delete Clue
            </button>
          </form>
        )}
      />
    </section>
  );
}
