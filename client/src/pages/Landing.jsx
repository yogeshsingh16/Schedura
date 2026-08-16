import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Landing.css';

const features = [
  {
    icon: '📅',
    title: 'Interactive Calendar',
    description: 'Visualize all your events in beautiful month, week, and day views. Never miss an important date again.',
    color: 'rgba(67, 97, 238, 0.12)'
  },
  {
    icon: '🎫',
    title: 'Easy Registration',
    description: 'Register for events with a single click. Track your registrations and manage your schedule effortlessly.',
    color: 'rgba(114, 9, 183, 0.12)'
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Get notified about event updates, reminders, and new registrations. Stay in the loop, always.',
    color: 'rgba(247, 37, 133, 0.12)'
  },
  {
    icon: '👥',
    title: 'Attendee Management',
    description: 'Track who\'s coming, manage capacity, and see real-time registration counts for your events.',
    color: 'rgba(76, 201, 240, 0.12)'
  },
  {
    icon: '🔍',
    title: 'Search & Filter',
    description: 'Find the perfect event by searching, filtering by category, date, or location. Discover what matters to you.',
    color: 'rgba(72, 149, 239, 0.12)'
  },
  {
    icon: '✨',
    title: 'Create & Customize',
    description: 'Create stunning events with rich details, categories, tags, and virtual meeting support.',
    color: 'rgba(86, 11, 173, 0.12)'
  }
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-orb" />
        <div className="container landing-hero-content">
          <div className="landing-hero-badge">
            ✨ The modern event platform
          </div>
          <h1>
            Organize Events<br />
            <span className="text-gradient">Effortlessly</span>
          </h1>
          <p className="landing-hero-subtitle">
            Schedura makes it simple to create, manage, and discover events. 
            From conferences to meetups, bring people together with a platform 
            that&apos;s as polished as your events.
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
                <Link to="/events" className="btn btn-secondary btn-lg">Explore Events</Link>
              </>
            )}
          </div>

          <div className="landing-stats">
            <div className="landing-stat">
              <div className="landing-stat-value">100+</div>
              <div className="landing-stat-label">Events Created</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">500+</div>
              <div className="landing-stat-label">Active Users</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">50+</div>
              <div className="landing-stat-label">Organizations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="container">
          <div className="landing-section-header">
            <h2>Everything you need to <span className="text-gradient">manage events</span></h2>
            <p>Powerful features designed to make event management a breeze.</p>
          </div>
          <div className="landing-features-grid stagger-children">
            {features.map((feature, i) => (
              <div key={i} className="glass-card landing-feature-card">
                <div className="landing-feature-icon" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <div className="landing-cta-card">
            <h2>Ready to get started?</h2>
            <p>Join Schedura today and start organizing unforgettable events.</p>
            {user ? (
              <Link to="/create-event" className="btn btn-primary btn-lg">Create Your First Event</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">Sign Up for Free →</Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
