import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Calendar from './pages/Calendar';
import MyEvents from './pages/MyEvents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="app-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute><CreateEvent /></ProtectedRoute>
            } />
            <Route path="/edit-event/:id" element={
              <ProtectedRoute><EditEvent /></ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute><Calendar /></ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute><MyEvents /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><Notifications /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
