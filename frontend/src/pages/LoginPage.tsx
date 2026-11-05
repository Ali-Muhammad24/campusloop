import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { validateEmail, validateRequired } from '../utils/validation';
import * as api from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState(''); // e.g. wrong email or password
  const [loading, setLoading] = useState(false);

  // One handler for both fields: the input's "name" says which value to update.
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Hide the field's error once the user starts fixing it.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');

    const newErrors: LoginErrors = {
      email: validateEmail(values.email),
      password: validateRequired(values.password, 'Password'),
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      const user = await api.login(values.email, values.password);
      dispatch(login(user));
      // Admins go to their dashboard, Students go to the Catalogue.
      navigate(user.role === 'Admin' ? '/admin/dashboard' : '/', { replace: true });
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Login</h1>

      {loginError && (
        <p className="alert-error" role="alert">
          {loginError}
        </p>
      )}

      {/* noValidate: our own validation shows the messages instead of the browser's popups. */}
      <form className="form" onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          disabled={loading}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginPage;
