import { useState, useEffect } from 'react';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './Events.css';

const categories = ['All', 'Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Other'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchEvents();
  }, [page, category]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEvents();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);

      const { data } = await api.get(`/events?${params}`);
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-page">
      <div className="container">
        <div className="events-header">
          <h1>Explore Events 🎫</h1>
          <p>Discover and register for upcoming events that interest you.</p>
        </div>

        {/* Filters */}
        <div className="events-filters">
          <div className="events-search">
            <span className="events-search-icon">🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select events-filter-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? '🏷️ All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No events found"
            message={search ? `No events match "${search}". Try a different search term.` : 'No events available in this category yet.'}
          />
        ) : (
          <>
            <div className="events-grid stagger-children">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="events-pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
                <span className="events-pagination-info">
                  Page {pagination.current} of {pagination.pages} ({pagination.total} events)
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
