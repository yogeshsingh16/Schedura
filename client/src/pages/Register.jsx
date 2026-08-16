import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { user, register, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await register(form.name, form.email, form.password);
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
          <h1>Create account</h1>
          <p>Start managing events with Schedura</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          
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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
