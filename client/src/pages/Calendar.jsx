import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Calendar.css';

export default function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const { data } = await api.get('/events?limit=200');
      const calendarEvents = data.events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.date,
        end: event.endDate || event.date,
        color: event.color || '#4361ee',
        extendedProps: {
          category: event.category,
          location: event.location,
          time: event.time
        }
      }));
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching events for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    navigate(`/events/${info.event.id}`);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="calendar-page">
      <div className="container">
        <div className="calendar-header">
          <h1>Event Calendar 📅</h1>
          <p>View all events in an interactive calendar.</p>
        </div>

        <div className="calendar-wrapper">
          <div className="glass-card-static">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              dayMaxEvents={3}
              eventDisplay="block"
              nowIndicator={true}
              weekends={true}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                list: 'List'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
