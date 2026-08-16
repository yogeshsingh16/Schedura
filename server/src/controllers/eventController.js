const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const { notifyRegistration, notifyEventUpdate, notifyEventCancellation } = require('../utils/notifications');

// @desc    Get all events (with search, filter, pagination)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { search, category, status, startDate, endDate, page = 1, limit = 12 } = req.query;
    const query = {};

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name email avatarColor')
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatarColor')
      .populate('attendees', 'name email avatarColor');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    // Set color based on category
    const categoryColors = {
      'Conference': '#4361ee',
      'Workshop': '#7209b7',
      'Meetup': '#f72585',
      'Webinar': '#4cc9f0',
      'Social': '#4895ef',
      'Other': '#560bad'
    };
    eventData.color = categoryColors[eventData.category] || '#4361ee';

    const event = await Event.create(eventData);
    await event.populate('organizer', 'name email avatarColor');

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only organizer can update
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update this event' });
    }

    // Update color if category changed
    if (req.body.category) {
      const categoryColors = {
        'Conference': '#4361ee',
        'Workshop': '#7209b7',
        'Meetup': '#f72585',
        'Webinar': '#4cc9f0',
        'Social': '#4895ef',
        'Other': '#560bad'
      };
      req.body.color = categoryColors[req.body.category] || '#4361ee';
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'name email avatarColor')
      .populate('attendees', 'name email avatarColor');

    // Notify attendees about the update
    if (event.attendees.length > 0) {
      const attendeeIds = event.attendees.map(a => a._id);
      await notifyEventUpdate(event, attendeeIds);
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only organizer can delete
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can delete this event' });
    }

    // Notify attendees about cancellation
    if (event.attendees.length > 0) {
      await notifyEventCancellation(event, event.attendees);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatarColor');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Cannot register for own event
    if (event.organizer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot register for your own event' });
    }

    // Check if already registered
    if (event.attendees.some(a => a.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check capacity
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'This event is full' });
    }

    // Check if event is cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'This event has been cancelled' });
    }

    event.attendees.push(req.user._id);
    await event.save();

    // Notify organizer
    await notifyRegistration(event.organizer, req.user.name, event);

    await event.populate('attendees', 'name email avatarColor');
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc    Unregister from an event
// @route   DELETE /api/events/:id/unregister
exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if registered
    const index = event.attendees.findIndex(a => a.toString() === req.user._id.toString());
    if (index === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.attendees.splice(index, 1);
    await event.save();

    await event.populate('organizer', 'name email avatarColor');
    await event.populate('attendees', 'name email avatarColor');
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's organized events
// @route   GET /api/events/user/organized
exports.getOrganizedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('organizer', 'name email avatarColor')
      .sort({ date: -1 });

    res.json({ events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/user/registered
exports.getRegisteredEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ attendees: req.user._id })
      .populate('organizer', 'name email avatarColor')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    next(error);
  }
};
