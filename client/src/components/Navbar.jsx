import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        setUnreadCount(data.count);
      } catch {
        // ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Landing/auth pages: minimal navbar
  if (!user) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">S</div>
          <span className="navbar-brand-text">Schedura</span>
        </Link>
        <div className="navbar-nav">
          <Link to="/events" className={isActive('/events')}>
            <span className="nav-icon">🔍</span> Explore
          </Link>
          <Link to="/login" className={`btn btn-ghost ${isActive('/login')}`}>Log In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
        <button className="navbar-toggle" onClick={() => setMobileOpen(true)}>☰</button>
        
        {/* Mobile sidebar for unauthenticated */}
        <div className={`mobile-sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
          <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            <div className="mobile-sidebar-header">
              <span className="navbar-brand-text">Schedura</span>
              <button onClick={() => setMobileOpen(false)} style={{ width: 'auto', padding: '0.5rem' }}>✕</button>
            </div>
            <Link to="/events">🔍 Explore Events</Link>
            <Link to="/login">🔑 Log In</Link>
            <Link to="/register">✨ Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <div className="navbar-logo">S</div>
        <span className="navbar-brand-text">Schedura</span>
      </Link>

      <div className="navbar-nav">
        <Link to="/dashboard" className={isActive('/dashboard')}>
          <span className="nav-icon">🏠</span> Dashboard
        </Link>
        <Link to="/events" className={isActive('/events')}>
          <span className="nav-icon">🎫</span> Events
        </Link>
        <Link to="/calendar" className={isActive('/calendar')}>
          <span className="nav-icon">📅</span> Calendar
        </Link>
        <Link to="/my-events" className={isActive('/my-events')}>
          <span className="nav-icon">📋</span> My Events
        </Link>
        <Link to="/notifications" className={`nav-notification ${isActive('/notifications')}`}>
          <span className="nav-icon">🔔</span> Notifications
          {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Link>
      </div>

      {/* User Menu */}
      <div className="nav-user-desktop" ref={dropdownRef} style={{ position: 'relative' }}>
        <button className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="nav-avatar" style={{ background: user.avatarColor || 'var(--accent-primary)' }}>
            {getInitials(user.name)}
          </div>
          <span className="nav-username">{user.name?.split(' ')[0]}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dropdownOpen ? '▲' : '▼'}</span>
        </button>

        {dropdownOpen && (
          <div className="nav-dropdown">
            <Link to="/profile">👤 Profile</Link>
            <Link to="/create-event">✨ Create Event</Link>
            <div className="nav-dropdown-divider" />
            <button className="logout-btn" onClick={handleLogout}>🚪 Log Out</button>
          </div>
        )}
      </div>

      <button className="navbar-toggle" onClick={() => setMobileOpen(true)}>☰</button>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
          <div className="mobile-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="nav-avatar" style={{ background: user.avatarColor }}>
                {getInitials(user.name)}
              </div>
              <span className="navbar-brand-text" style={{ fontSize: '1rem' }}>{user.name}</span>
            </div>
            <button onClick={() => setMobileOpen(false)} style={{ width: 'auto', padding: '0.5rem' }}>✕</button>
          </div>
          <Link to="/dashboard" className={isActive('/dashboard')}>🏠 Dashboard</Link>
          <Link to="/events" className={isActive('/events')}>🎫 Events</Link>
          <Link to="/calendar" className={isActive('/calendar')}>📅 Calendar</Link>
          <Link to="/my-events" className={isActive('/my-events')}>📋 My Events</Link>
          <Link to="/create-event">✨ Create Event</Link>
          <Link to="/notifications" className={isActive('/notifications')}>
            🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Link>
          <Link to="/profile">👤 Profile</Link>
          <div className="nav-dropdown-divider" />
          <button className="logout-btn" onClick={handleLogout}>🚪 Log Out</button>
        </div>
      </div>
    </nav>
  );
}
