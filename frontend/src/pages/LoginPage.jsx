import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPanel from '../components/AuthPanel';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';

/* ── Google SVG icon ───────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
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
      const { data } = await authApi.login(form);
      localStorage.setItem('jt_token', data.token);
      localStorage.setItem('jt_user', JSON.stringify({ username: data.username, email: data.email }));
      toast.success('Welcome back!', `Logged in as ${data.username}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      toast.error('Login failed', msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    toast.info('Coming soon', 'Google sign-in is not available yet.');
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
            <h1 className="auth-card__title">Sign in</h1>
            <p className="auth-card__subtitle">
              Welcome back — let's pick up where you left off.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
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
              <label className="field__label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                className={`field__input${errors.password ? ' field__input--error' : ''}`}
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">or continue with</div>

          <button
            id="login-google"
            type="button"
            className="btn-google"
            onClick={handleGoogleClick}
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <p className="auth-footer">
            New here?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
