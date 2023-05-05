import { Field, withTypes } from 'react-final-form';

export interface HuntConfigState {
  targetAge?: string;
  theme?: string;
}

interface HuntConfigProps {
  huntConfig: HuntConfigState;
  onChange: (state: HuntConfigState) => void;
}

const { Form } = withTypes<HuntConfigState>();

export function HuntConfig({ huntConfig, onChange }: HuntConfigProps) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <Form
        onSubmit={console.log}
        initialValues={huntConfig}
        render={({ values }) => (
          <form onChange={() => onChange(values)}>
            <label htmlFor="targetAge">Target Age (optional)</label>
            <Field name="targetAge" type="text" component="input" placeholder="12" />
            <br />
            <label htmlFor="theme">Theme (optional)</label>
            <Field name="theme" type="text" component="input" placeholder="pirate" />
          </form>
        )}
      />
    </section>
  );
}
