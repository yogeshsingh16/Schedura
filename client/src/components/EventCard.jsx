import { useNavigate } from 'react-router-dom';
import './EventCard.css';

const categoryIcons = {
  Conference: '🎤',
  Workshop: '🔧',
  Meetup: '🤝',
  Webinar: '💻',
  Social: '🎉',
  Other: '📌'
};

const categoryBadgeClass = {
  Conference: 'badge-primary',
  Workshop: 'badge-secondary',
  Meetup: 'badge-pink',
  Webinar: 'badge-cyan',
  Social: 'badge-success',
  Other: 'badge-warning'
};

const statusBadgeClass = {
  upcoming: 'badge-primary',
  ongoing: 'badge-success',
  completed: 'badge-warning',
  cancelled: 'badge-danger'
};

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event._id}`)}>
      {/* Banner */}
      <div className="event-card-banner">
        <div
          className="event-card-banner-gradient"
          style={{
            background: `linear-gradient(135deg, ${event.color || '#4361ee'}22, ${event.color || '#4361ee'}44)`
          }}
        >
          <span style={{ zIndex: 1 }}>{categoryIcons[event.category] || '📌'}</span>
        </div>
        <span className={`badge ${categoryBadgeClass[event.category]} event-card-category`}>
          {event.category}
        </span>
        {event.status !== 'upcoming' && (
          <span className={`badge ${statusBadgeClass[event.status]} event-card-status`}>
            {event.status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="event-card-body">
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon">📅</span>
            {formatDate(event.date)}
          </div>
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon">🕐</span>
            {event.time}{event.endTime ? ` – ${event.endTime}` : ''}
          </div>
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon">{event.isVirtual ? '🌐' : '📍'}</span>
            {event.location}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="event-card-footer">
        <div className="event-card-organizer">
          <div
            className="event-card-organizer-avatar"
            style={{ background: event.organizer?.avatarColor || 'var(--accent-primary)' }}
          >
            {getInitials(event.organizer?.name)}
          </div>
          {event.organizer?.name}
        </div>
        <div className="event-card-attendees">
          {event.attendees?.length > 0 && (
            <div className="event-card-attendee-dots">
              {event.attendees.slice(0, 3).map((att, i) => (
                <div
                  key={i}
                  className="event-card-attendee-dot"
                  style={{ background: att?.avatarColor || 'var(--accent-secondary)' }}
                >
                  {typeof att === 'object' ? getInitials(att.name) : ''}
                </div>
              ))}
            </div>
          )}
          <span>👥 {event.attendees?.length || 0}{event.maxAttendees ? `/${event.maxAttendees}` : ''}</span>
        </div>
      </div>
    </div>
  );
}
