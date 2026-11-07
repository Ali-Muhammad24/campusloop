import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import FormInput from './FormInput';
import { getTomorrow, validateFutureDate, validateRequired } from '../utils/validation';
import * as api from '../services/api';

// The form a Student fills in to borrow an item. New requests start as Pending.

interface RequestFormProps {
  itemId: number;
  studentId: number;
}

interface RequestValues {
  purpose: string;
  expectedReturnDate: string;
}

type RequestErrors = Partial<Record<keyof RequestValues, string>>;

function RequestForm({ itemId, studentId }: RequestFormProps) {
  const [values, setValues] = useState<RequestValues>({ purpose: '', expectedReturnDate: '' });
  const [errors, setErrors] = useState<RequestErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');

    const newErrors: RequestErrors = {
      purpose: validateRequired(values.purpose, 'Purpose'),
      expectedReturnDate: validateFutureDate(values.expectedReturnDate),
    };
    setErrors(newErrors);
    if (newErrors.purpose || newErrors.expectedReturnDate) return;

    setLoading(true);
    try {
      await api.createRequest(studentId, itemId, values.purpose, values.expectedReturnDate);
      setSuccess(true);
    } catch (error) {
      // The form keeps what the user typed, so they can try again.
      setSubmitError(error instanceof Error ? error.message : 'Could not send the request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p className="alert-success" role="status">
        Request sent! It's now Pending. You can follow it on <Link to="/my-requests">My Requests</Link>.
      </p>
    );
  }

  return (
    <>
      {submitError && (
        <p className="alert-error" role="alert">
          {submitError}
        </p>
      )}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Purpose"
          name="purpose"
          value={values.purpose}
          onChange={handleChange}
          error={errors.purpose}
          placeholder="What will you use it for?"
          multiline
          disabled={loading}
        />
        <FormInput
          label="Expected return date"
          name="expectedReturnDate"
          type="date"
          value={values.expectedReturnDate}
          onChange={handleChange}
          error={errors.expectedReturnDate}
          min={getTomorrow()}
          disabled={loading}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Sending request...' : 'Send request'}
        </button>
      </form>
    </>
  );
}

export default RequestForm;
