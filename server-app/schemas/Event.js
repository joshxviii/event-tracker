const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "14:30"
  },
  endTime: {
    type: String,
    required: true // Format: "16:00"
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    city: String,
    country: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxAttendees: {
    type: Number,
    min: 1
  },
  category: {
    type: String,
    enum: ['volunteer','social', 'market', 'other'],
    required: true
  },
  image: {
    type: String, // URL to event image
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  registrationDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for formatted date/time
eventSchema.virtual('formattedDateTime').get(function() {
  return {
    date: this.date.toLocaleDateString(),
    start: this.startTime,
    end: this.endTime
  };
});

module.exports = mongoose.model('Event', eventSchema);