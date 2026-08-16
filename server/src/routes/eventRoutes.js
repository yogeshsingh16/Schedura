const express = require('express');
const { body } = require('express-validator');
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  registerForEvent, unregisterFromEvent,
  getOrganizedEvents, getRegisteredEvents
} = require('../controllers/eventController');
const auth = require('../middleware/auth');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes (must be before /:id to avoid conflicts)
router.get('/user/organized', auth, getOrganizedEvents);
router.get('/user/registered', auth, getRegisteredEvents);

router.post('/', auth, eventValidation, createEvent);
router.put('/:id', auth, eventValidation, updateEvent);
router.delete('/:id', auth, deleteEvent);

router.post('/:id/register', auth, registerForEvent);
router.delete('/:id/unregister', auth, unregisterFromEvent);

module.exports = router;
