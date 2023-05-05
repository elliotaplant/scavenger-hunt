import { Field, withTypes } from 'react-final-form';
import { required } from '../utils/form';
import { useState } from 'react';
import { FORM_ERROR } from 'final-form';

interface ClueProps {
  onDelete?: () => void;
}

interface ClueFormFields {
  location: string;
  context: string;
}

const { Form } = withTypes<ClueFormFields>();

export function Clue({ onDelete }: ClueProps) {
  const [generating, setGenerating] = useState(false);
  const [clueResult, setClueResult] = useState(false);

  const generateClue = async ({ location, context }: ClueFormFields) => {
    setGenerating(true);
    let url = '/.netlify/functions/generate-clue?';
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
      const response = await fetch(url + search.toString());
      const { clue } = await response.json();
      console.log('clue', clue);
      setClueResult(clue);
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
            {clueResult && (
              <pre>
                <code>{clueResult}</code>
              </pre>
            )}
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <button
              name="generateButton"
              type="submit"
              disabled={generating || hasValidationErrors}
              style={{ marginRight: '1rem' }}
            >
              Generate Clue
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
