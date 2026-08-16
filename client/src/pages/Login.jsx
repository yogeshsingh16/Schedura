import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { user, login, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await login(form.email, form.password);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  return (
    <div className="auth-page">
      <div className="glass-card-static auth-card">
        <div className="auth-header">
          <div className="auth-logo">S</div>
          <h1>Welcome back</h1>
          <p>Sign in to your Schedura account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
