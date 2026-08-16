import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './CreateEvent.css';

const categories = ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Conference',
    date: '', endDate: '', time: '', endTime: '',
    location: '', isVirtual: false, meetingLink: '',
    maxAttendees: '', tags: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.maxAttendees) payload.maxAttendees = parseInt(payload.maxAttendees);
      else delete payload.maxAttendees;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.endTime) delete payload.endTime;
      if (!payload.meetingLink) delete payload.meetingLink;

      const { data } = await api.post('/events', payload);
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <div className="container">
        <div className="create-event-header">
          <h1>Create Event ✨</h1>
          <p>Fill in the details to create a new event.</p>
        </div>

        <div className="create-event-form">
          <form onSubmit={handleSubmit}>
            <div className="glass-card-static">
              {error && <div className="auth-error" style={{ marginBottom: 'var(--space-lg)' }}>{error}</div>}

              {/* Basic Info */}
              <div className="create-event-section">
                <h3>📝 Basic Information</h3>
                <div className="create-event-form-fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">Event Title</label>
                    <input id="title" name="title" className="form-input" placeholder="Give your event a catchy title" value={form.title} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="form-textarea" placeholder="Describe your event in detail..." value={form.description} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="create-event-section">
                <h3>📅 Date & Time</h3>
                <div className="create-event-form-fields">
                  <div className="create-event-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Start Date</label>
                      <input id="date" name="date" type="date" className="form-input" value={form.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="time">Start Time</label>
                      <input id="time" name="time" type="time" className="form-input" value={form.time} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="create-event-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="endDate">End Date <span className="form-hint">(optional)</span></label>
                      <input id="endDate" name="endDate" type="date" className="form-input" value={form.endDate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="endTime">End Time <span className="form-hint">(optional)</span></label>
                      <input id="endTime" name="endTime" type="time" className="form-input" value={form.endTime} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="create-event-section">
                <h3>📍 Location</h3>
                <div className="create-event-form-fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location / Venue</label>
                    <input id="location" name="location" className="form-input" placeholder="e.g., Convention Center, Room 101" value={form.location} onChange={handleChange} required />
                  </div>
                  <label className="create-event-virtual-toggle">
                    <input type="checkbox" name="isVirtual" checked={form.isVirtual} onChange={handleChange} />
                    <span>🌐 This is a virtual event</span>
                  </label>
                  {form.isVirtual && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="meetingLink">Meeting Link</label>
                      <input id="meetingLink" name="meetingLink" className="form-input" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={handleChange} />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional */}
              <div className="create-event-section">
                <h3>⚙️ Additional Settings</h3>
                <div className="create-event-form-fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="maxAttendees">Max Attendees <span className="form-hint">(optional, leave empty for unlimited)</span></label>
                    <input id="maxAttendees" name="maxAttendees" type="number" className="form-input" placeholder="50" min="1" value={form.maxAttendees} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags <span className="form-hint">(press Enter to add)</span></label>
                    <div className="create-event-tags-input">
                      {form.tags.map(tag => (
                        <span key={tag} className="create-event-tag">
                          #{tag}
                          <button type="button" onClick={() => removeTag(tag)}>✕</button>
                        </span>
                      ))}
                      <input
                        className="form-input"
                        style={{ flex: 1, minWidth: '120px' }}
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="create-event-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : '✨ Create Event'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
