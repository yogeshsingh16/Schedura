import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

export default function Profile() {
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      await loadUser();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Profile 👤</h1>
          <p>Manage your account information.</p>
        </div>

        <div className="profile-content">
          <div className="glass-card-static profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar" style={{ background: user?.avatarColor || 'var(--accent-primary)' }}>
                {getInitials(user?.name)}
              </div>
              <div className="profile-avatar-info">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}
              {success && <div className="profile-success">{success}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="profile-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
