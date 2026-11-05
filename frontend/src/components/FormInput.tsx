import { useId, type ChangeEvent } from 'react';

// A label, an input (or a textarea) and an error message, used by every form in the app.
// Forms keep the value and the errors in their own state and pass them in here.

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string; // 'text', 'email', 'password', 'date', ...
  error?: string; // shown in red under the input when set
  placeholder?: string;
  multiline?: boolean; // true shows a textarea, e.g. for a purpose or description
  min?: string; // e.g. the earliest date allowed for a date input
  autoComplete?: string;
  disabled?: boolean;
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  multiline = false,
  min,
  autoComplete,
  disabled,
}: FormInputProps) {
  // Unique ids link the label and the error message to the input (for screen readers).
  const id = useId();
  const errorId = `${id}-error`;

  const sharedProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea {...sharedProps} rows={4} />
      ) : (
        <input {...sharedProps} type={type} min={min} autoComplete={autoComplete} />
      )}
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormInput;
