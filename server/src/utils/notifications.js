const Notification = require('../models/Notification');

/**
 * Create a notification for a specific user
 */
const createNotification = async ({ user, type, title, message, event }) => {
  try {
    await Notification.create({ user, type, title, message, event });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

/**
 * Notify organizer when someone registers for their event
 */
const notifyRegistration = async (organizer, attendeeName, event) => {
  await createNotification({
    user: organizer._id || organizer,
    type: 'registration',
    title: 'New Registration',
    message: `${attendeeName} registered for your event "${event.title}"`,
    event: event._id || event
  });
};

/**
 * Notify all attendees when an event is updated
 */
const notifyEventUpdate = async (event, attendees) => {
  const promises = attendees.map(attendeeId =>
    createNotification({
      user: attendeeId,
      type: 'update',
      title: 'Event Updated',
      message: `The event "${event.title}" has been updated. Check the latest details.`,
      event: event._id || event
    })
  );
  await Promise.all(promises);
};

/**
 * Notify all attendees when an event is cancelled
 */
const notifyEventCancellation = async (event, attendees) => {
  const promises = attendees.map(attendeeId =>
    createNotification({
      user: attendeeId,
      type: 'cancellation',
      title: 'Event Cancelled',
      message: `The event "${event.title}" has been cancelled.`,
      event: event._id || event
    })
  );
  await Promise.all(promises);
};

/**
 * Create reminder notifications for events happening tomorrow
 */
const createEventReminders = async () => {
  const Event = require('../models/Event');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const upcomingEvents = await Event.find({
    date: { $gte: tomorrow, $lt: dayAfterTomorrow },
    status: 'upcoming'
  });

  for (const event of upcomingEvents) {
    const promises = event.attendees.map(attendeeId =>
      createNotification({
        user: attendeeId,
        type: 'reminder',
        title: 'Event Tomorrow',
        message: `Reminder: "${event.title}" is happening tomorrow!`,
        event: event._id
      })
    );
    await Promise.all(promises);
  }
  
  console.log(`📧 Created reminders for ${upcomingEvents.length} events happening tomorrow`);
};

module.exports = {
  createNotification,
  notifyRegistration,
  notifyEventUpdate,
  notifyEventCancellation,
  createEventReminders
};
