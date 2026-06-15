import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPanel from '../components/AuthPanel';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.trim().length < 3) e.username = 'Must be at least 3 characters';
    else if (form.username.trim().length > 50) e.username = 'Must be 50 characters or fewer';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters required';

    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';

    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem('jt_token', data.token);
      localStorage.setItem('jt_user', JSON.stringify({ username: data.username, email: data.email }));
      toast.success('Account created!', `Welcome, ${data.username}`);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        // Map server validation errors back onto fields
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      } else {
        toast.error('Registration failed', detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthPanel />

      <main className="auth-form-area">
        <div className="auth-card fade-up">
          {/* Mobile-only brand */}
          <div className="auth-card__mobile-brand">
            <span className="auth-card__mobile-brand-dot" />
            <span className="auth-card__mobile-brand-name">JobTracker</span>
          </div>

          <div className="auth-card__heading">
            <h1 className="auth-card__title">Create account</h1>
            <p className="auth-card__subtitle">
              Start tracking your applications in minutes.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. janedoe"
                value={form.username}
                onChange={handleChange}
                className={`field__input${errors.username ? ' field__input--error' : ''}`}
              />
              {errors.username && <span className="field__error">{errors.username}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={`field__input${errors.email ? ' field__input--error' : ''}`}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className={`field__input${errors.password ? ' field__input--error' : ''}`}
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={handleChange}
                className={`field__input${errors.confirm ? ' field__input--error' : ''}`}
              />
              {errors.confirm && <span className="field__error">{errors.confirm}</span>}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
