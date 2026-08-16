import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './Notifications.css';

const notificationIcons = {
  registration: { emoji: '👤', color: 'rgba(67, 97, 238, 0.12)' },
  reminder: { emoji: '⏰', color: 'rgba(245, 158, 11, 0.12)' },
  update: { emoji: '📝', color: 'rgba(114, 9, 183, 0.12)' },
  cancellation: { emoji: '❌', color: 'rgba(239, 68, 68, 0.12)' }
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div className="notifications-header-left">
            <h1>Notifications 🔔</h1>
            <p>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            message="You're all caught up! Notifications will appear here when someone registers for your events or when events you've registered for are updated."
          />
        ) : (
          <div className="notifications-list stagger-children">
            {notifications.map(notif => {
              const iconData = notificationIcons[notif.type] || notificationIcons.update;
              return (
                <div
                  key={notif._id}
                  className={`glass-card notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif._id);
                    if (notif.event) navigate(`/events/${notif.event._id || notif.event}`);
                  }}
                >
                  <div className="notification-icon" style={{ background: iconData.color }}>
                    {iconData.emoji}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{formatTime(notif.createdAt)}</div>
                  </div>
                  <div className="notification-actions" onClick={e => e.stopPropagation()}>
                    {!notif.read && (
                      <button
                        className="notification-action-btn"
                        onClick={() => markAsRead(notif._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="notification-action-btn"
                      onClick={() => deleteNotification(notif._id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
