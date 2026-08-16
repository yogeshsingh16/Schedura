import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './MyEvents.css';

export default function MyEvents() {
  const [tab, setTab] = useState('organized');
  const [organized, setOrganized] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const [orgRes, regRes] = await Promise.all([
        api.get('/events/user/organized'),
        api.get('/events/user/registered')
      ]);
      setOrganized(orgRes.data.events);
      setRegistered(regRes.data.events);
    } catch (err) {
      console.error('Error fetching my events:', err);
    } finally {
      setLoading(false);
    }
  };

  const events = tab === 'organized' ? organized : registered;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="my-events">
      <div className="container">
        <div className="my-events-header">
          <h1>My Events 📋</h1>
          <p>Manage events you&apos;ve created or registered for.</p>
        </div>

        <div className="my-events-tabs">
          <button
            className={`my-events-tab ${tab === 'organized' ? 'active' : ''}`}
            onClick={() => setTab('organized')}
          >
            Organized ({organized.length})
          </button>
          <button
            className={`my-events-tab ${tab === 'registered' ? 'active' : ''}`}
            onClick={() => setTab('registered')}
          >
            Registered ({registered.length})
          </button>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={tab === 'organized' ? '📋' : '🎫'}
            title={tab === 'organized' ? 'No events created yet' : 'No registrations yet'}
            message={tab === 'organized'
              ? 'Create your first event and start bringing people together.'
              : 'Browse events and register for ones that interest you.'}
            actionLabel={tab === 'organized' ? 'Create Event' : 'Browse Events'}
            actionLink={tab === 'organized' ? '/create-event' : '/events'}
          />
        ) : (
          <div className="my-events-grid stagger-children">
            {events.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
