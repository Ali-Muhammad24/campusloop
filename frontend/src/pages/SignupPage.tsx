import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { validateEmail, validateRequired } from '../utils/validation';
import * as api from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';

// How long the success message stays before going to the Catalogue.
const REDIRECT_DELAY_MS = 1500;

interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type SignupErrors = Partial<Record<keyof SignupValues, string>>;

function validate(values: SignupValues): SignupErrors {
  let confirmPassword: string | undefined;
  if (values.confirmPassword === '') {
    confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    confirmPassword = 'Passwords do not match.';
  }
  return {
    name: validateRequired(values.name, 'Name'),
    email: validateEmail(values.email),
    password: validateRequired(values.password, 'Password'),
    confirmPassword,
  };
}

function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [values, setValues] = useState<SignupValues>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [signupError, setSignupError] = useState(''); // e.g. email already used
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cancel the redirect timer if the user leaves the page before it runs.
  const redirectTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupError('');

    const newErrors = validate(values);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      // api.signup always creates a Student account.
      const user = await api.signup(values.name, values.email, values.password);
      dispatch(login(user));
      setSuccess(true);
      redirectTimer.current = window.setTimeout(() => navigate('/', { replace: true }), REDIRECT_DELAY_MS);
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : 'Sign up failed. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card auth-card">
        <h1>Sign Up</h1>
        <p className="alert-success" role="status">
          Account created! Welcome, {values.name.trim()}. Taking you to the Catalogue...
        </p>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <h1>Sign Up</h1>

      {signupError && (
        <p className="alert-error" role="alert">
          {signupError}
        </p>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
          disabled={loading}
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={loading}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          disabled={loading}
        />
        <FormInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default SignupPage;
