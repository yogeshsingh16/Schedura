const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    index: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxAttendees: {
    type: Number,
    min: [1, 'Max attendees must be at least 1']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String,
    trim: true
  }],
  color: {
    type: String,
    default: function () {
      const categoryColors = {
        'Conference': '#4361ee',
        'Workshop': '#7209b7',
        'Meetup': '#f72585',
        'Webinar': '#4cc9f0',
        'Social': '#4895ef',
        'Other': '#560bad'
      };
      return categoryColors[this.category] || '#4361ee';
    }
  }
}, {
  timestamps: true
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees ? this.attendees.length : 0;
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
  if (!this.maxAttendees) return false;
  return this.attendees.length >= this.maxAttendees;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
