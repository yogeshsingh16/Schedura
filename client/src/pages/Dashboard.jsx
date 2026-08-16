import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './Dashboard.css';

const categoryBadgeClass = {
  Conference: 'badge-primary',
  Workshop: 'badge-secondary',
  Meetup: 'badge-pink',
  Webinar: 'badge-cyan',
  Social: 'badge-success',
  Other: 'badge-warning'
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ organized: 0, registered: 0, upcoming: 0, notifications: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [organizedRes, registeredRes, notifRes] = await Promise.all([
        api.get('/events/user/organized'),
        api.get('/events/user/registered'),
        api.get('/notifications')
      ]);

      const organized = organizedRes.data.events;
      const registered = registeredRes.data.events;
      const allEvents = [...organized, ...registered];
      
      // Upcoming events (deduplicated, future only)
      const now = new Date();
      const upcoming = allEvents
        .filter((e, i, arr) => arr.findIndex(x => x._id === e._id) === i)
        .filter(e => new Date(e.date) >= now && e.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

      setStats({
        organized: organized.length,
        registered: registered.length,
        upcoming: upcoming.length,
        notifications: notifRes.data.unreadCount
      });
      setUpcomingEvents(upcoming);
      setRecentNotifications(notifRes.data.notifications.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    };
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here&apos;s what&apos;s happening with your events.</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="glass-card dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(67, 97, 238, 0.12)' }}>📋</div>
            <div className="dashboard-stat-info">
              <h3>{stats.organized}</h3>
              <p>Events Organized</p>
            </div>
          </div>
          <div className="glass-card dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(114, 9, 183, 0.12)' }}>🎫</div>
            <div className="dashboard-stat-info">
              <h3>{stats.registered}</h3>
              <p>Registered Events</p>
            </div>
          </div>
          <div className="glass-card dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(76, 201, 240, 0.12)' }}>📅</div>
            <div className="dashboard-stat-info">
              <h3>{stats.upcoming}</h3>
              <p>Upcoming Events</p>
            </div>
          </div>
          <div className="glass-card dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(247, 37, 133, 0.12)' }}>🔔</div>
            <div className="dashboard-stat-info">
              <h3>{stats.notifications}</h3>
              <p>Unread Notifications</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <Link to="/create-event" className="btn btn-primary">✨ Create Event</Link>
          <Link to="/events" className="btn btn-secondary">🔍 Browse Events</Link>
          <Link to="/calendar" className="btn btn-secondary">📅 View Calendar</Link>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Upcoming Events */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>📅 Upcoming Events</h2>
              <Link to="/my-events" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No upcoming events"
                message="Create an event or register for one to see it here."
                actionLabel="Browse Events"
                actionLink="/events"
              />
            ) : (
              <div className="dashboard-event-list">
                {upcomingEvents.map(event => {
                  const { month, day } = formatDate(event.date);
                  return (
                    <div
                      key={event._id}
                      className="glass-card dashboard-event-item"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      <div className="dashboard-event-date" style={{ background: event.color || 'var(--accent-primary)' }}>
                        <span className="dashboard-event-date-month">{month}</span>
                        <span className="dashboard-event-date-day">{day}</span>
                      </div>
                      <div className="dashboard-event-info">
                        <h4>{event.title}</h4>
                        <p>{event.time} · {event.location}</p>
                      </div>
                      <span className={`badge ${categoryBadgeClass[event.category]} dashboard-event-badge`}>
                        {event.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>🔔 Recent</h2>
              <Link to="/notifications" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {recentNotifications.length === 0 ? (
              <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
              </div>
            ) : (
              <div className="dashboard-event-list">
                {recentNotifications.map(notif => (
                  <div
                    key={notif._id}
                    className="glass-card dashboard-event-item"
                    style={{ opacity: notif.read ? 0.6 : 1, cursor: 'pointer' }}
                    onClick={() => navigate('/notifications')}
                  >
                    <div className="dashboard-stat-icon" style={{
                      background: notif.type === 'registration' ? 'rgba(67, 97, 238, 0.12)' :
                        notif.type === 'reminder' ? 'rgba(245, 158, 11, 0.12)' :
                        notif.type === 'cancellation' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(114, 9, 183, 0.12)',
                      width: '40px', height: '40px', fontSize: '1.1rem', borderRadius: '10px'
                    }}>
                      {notif.type === 'registration' ? '👤' : notif.type === 'reminder' ? '⏰' : notif.type === 'cancellation' ? '❌' : '📝'}
                    </div>
                    <div className="dashboard-event-info">
                      <h4 style={{ fontSize: '0.85rem' }}>{notif.title}</h4>
                      <p>{formatTimeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
