# Schedura — Event Management System

A full-stack event management platform built with the MERN stack. Create, manage, and register for events with an interactive calendar, real-time notifications, and attendee management.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, FullCalendar
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** MongoDB with Mongoose ODM

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone & install server dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

### Running the App

1. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## Features

- 🔐 User authentication (register/login/logout)
- 📅 Interactive event calendar (month/week/day views)
- 🎫 Event creation & management
- 👥 Attendee registration & tracking
- 🔔 In-app notification system
- 🔍 Search & filter events
- 📱 Fully responsive design
- 🌙 Premium dark theme with glassmorphism

## License

MIT
