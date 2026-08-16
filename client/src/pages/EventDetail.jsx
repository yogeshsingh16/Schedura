import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import './EventDetail.css';

const categoryIcons = {
  Conference: '🎤', Workshop: '🔧', Meetup: '🤝',
  Webinar: '💻', Social: '🎉', Other: '📌'
};

const categoryBadgeClass = {
  Conference: 'badge-primary', Workshop: 'badge-secondary', Meetup: 'badge-pink',
  Webinar: 'badge-cyan', Social: 'badge-success', Other: 'badge-warning'
};

const statusBadgeClass = {
  upcoming: 'badge-primary', ongoing: 'badge-success',
  completed: 'badge-warning', cancelled: 'badge-danger'
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch {
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const isOrganizer = user && event?.organizer?._id === user._id;
  const isRegistered = user && event?.attendees?.some(a => a._id === user._id);

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.post(`/events/${id}/register`);
      setEvent(data.event);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.delete(`/events/${id}/unregister`);
      setEvent(data.event);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return <LoadingSpinner fullScreen />;
  if (!event) return null;

  return (
    <div className="event-detail">
      <div className="container">
        <div className="event-detail-back">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="event-detail-content">
          {/* Main */}
          <div className="event-detail-main">
            <div
              className="event-detail-banner"
              style={{ background: `linear-gradient(135deg, ${event.color}22, ${event.color}44)` }}
            >
              <span style={{ zIndex: 1 }}>{categoryIcons[event.category] || '📌'}</span>
            </div>

            <div className="event-detail-badges">
              <span className={`badge ${categoryBadgeClass[event.category]}`}>{event.category}</span>
              <span className={`badge ${statusBadgeClass[event.status]}`}>{event.status}</span>
              {event.isVirtual && <span className="badge badge-cyan">🌐 Virtual</span>}
              {event.isFull && <span className="badge badge-danger">Full</span>}
            </div>

            <h1 className="event-detail-title">{event.title}</h1>
            <p className="event-detail-description">{event.description}</p>

            {event.tags?.length > 0 && (
              <div className="event-detail-tags">
                {event.tags.map((tag, i) => (
                  <span key={i} className="event-detail-tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Attendees Section */}
            {event.attendees?.length > 0 && (
              <div className="glass-card-static event-detail-attendees-card">
                <h3>👥 Attendees ({event.attendees.length}{event.maxAttendees ? `/${event.maxAttendees}` : ''})</h3>
                <div className="event-detail-attendees-list">
                  {event.attendees.map((att) => (
                    <div key={att._id} className="event-detail-attendee">
                      <div
                        className="event-detail-attendee-avatar"
                        style={{ background: att.avatarColor || 'var(--accent-primary)' }}
                      >
                        {getInitials(att.name)}
                      </div>
                      {att.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="event-detail-sidebar">
            {/* Event Info */}
            <div className="glass-card-static event-detail-info-card">
              <h3>Event Details</h3>
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">📅</span>
                <div className="event-detail-info-text">
                  <span className="event-detail-info-label">Date</span>
                  <span className="event-detail-info-value">{formatDate(event.date)}</span>
                </div>
              </div>
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">🕐</span>
                <div className="event-detail-info-text">
                  <span className="event-detail-info-label">Time</span>
                  <span className="event-detail-info-value">{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                </div>
              </div>
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">{event.isVirtual ? '🌐' : '📍'}</span>
                <div className="event-detail-info-text">
                  <span className="event-detail-info-label">Location</span>
                  <span className="event-detail-info-value">{event.location}</span>
                </div>
              </div>
              {event.isVirtual && event.meetingLink && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-icon">🔗</span>
                  <div className="event-detail-info-text">
                    <span className="event-detail-info-label">Meeting Link</span>
                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="event-detail-info-value" style={{ color: 'var(--accent-cyan)' }}>
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">👥</span>
                <div className="event-detail-info-text">
                  <span className="event-detail-info-label">Attendees</span>
                  <span className="event-detail-info-value">
                    {event.attendees?.length || 0}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} registered
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="event-detail-actions">
              {user ? (
                isOrganizer ? (
                  <>
                    <Link to={`/edit-event/${event._id}`} className="btn btn-primary">✏️ Edit Event</Link>
                    <button className="btn btn-danger" onClick={() => setDeleteModalOpen(true)}>🗑️ Delete Event</button>
                  </>
                ) : event.status !== 'cancelled' && (
                  isRegistered ? (
                    <button className="btn btn-secondary" onClick={handleUnregister} disabled={actionLoading}>
                      {actionLoading ? 'Processing...' : '✕ Unregister'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleRegister}
                      disabled={actionLoading || event.isFull}
                    >
                      {actionLoading ? 'Processing...' : event.isFull ? 'Event Full' : '🎫 Register Now'}
                    </button>
                  )
                )
              ) : (
                <Link to="/login" className="btn btn-primary">🔑 Login to Register</Link>
              )}
            </div>

            {/* Organizer Card */}
            <div className="glass-card-static event-detail-organizer">
              <div
                className="event-detail-organizer-avatar"
                style={{ background: event.organizer?.avatarColor || 'var(--accent-primary)' }}
              >
                {getInitials(event.organizer?.name)}
              </div>
              <div className="event-detail-organizer-info">
                <h4>{event.organizer?.name}</h4>
                <p>Organizer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Event"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone. All attendees will be notified.</p>
      </Modal>
    </div>
  );
}
