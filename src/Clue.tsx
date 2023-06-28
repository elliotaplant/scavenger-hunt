import { Field, withTypes } from 'react-final-form';
import { required } from './utils/form';
import { useState } from 'react';
import { FORM_ERROR } from 'final-form';
import { HuntConfigState } from './App';

const apiOrigin = process.env.REACT_APP_API_ORIGIN;

export interface ClueState {
  location?: string;
  context?: string;
  result?: string;
}

interface ClueProps {
  onDelete: () => void;
  onUpdate: (clue: ClueState) => void;
  initialValues: ClueState;
  huntConfig: HuntConfigState;
}

interface ClueFormFields {
  location: string;
  context: string;
}

const { Form } = withTypes<ClueFormFields>();

export function Clue({ initialValues, onUpdate, onDelete, huntConfig }: ClueProps) {
  const [generating, setGenerating] = useState(false);

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

    if (huntConfig.targetAge) {
      search.append('targetAge', huntConfig.targetAge);
    }

    if (huntConfig.theme) {
      search.append('theme', huntConfig.theme);
    }

    try {
      const response = await fetch(`${apiOrigin}/generate-clue?${search.toString()}`);
      const { clue, error } = await response.json();

      if (clue) {
        onUpdate({ location, context, result: clue });
      } else {
        throw new Error(error);
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
              {generating
                ? 'Generating Clue'
                : initialValues.result
                ? 'Regenerate Clue'
                : 'Generate Clue'}
            </button>
            {!generating && (
              <button
                name="deleteButton"
                style={{ backgroundColor: 'transparent', color: 'red', borderColor: 'red' }}
                type="button"
                onClick={onDelete}
              >
                Delete Clue
              </button>
            )}
          </form>
        )}
      />
    </section>
  );
}
