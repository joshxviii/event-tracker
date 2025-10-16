// Event Related Routes
const express = require('express');
const router = express.Router();
const Event = require('../schemas/Event');
const User = require('../schemas/User');

// Create event
router.post('/', async (req, res) => {
  try {
    const eventData = { ...req.body };

    const event = new Event(eventData);
    await event.save();

    // Add to organizer's created events
    await User.findByIdAndUpdate(eventData.organizer._id, {
      $push: { createdEvents: event._id }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'username firstName lastName')
      .populate('attendees', 'username firstName lastName')
      .sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events organized by a specific user
router.get('/organizer/:organizerId', async (req, res) => {
  try {

    const events = await Event.find({ organizer: req.params.organizerId })
      .populate('organizer', 'username firstName lastName')
      .populate('attendees', 'username firstName lastName')
      .sort({ date: 1, startTime: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username firstName lastName')
      .populate('attendees', 'username firstName lastName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    
    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // Remove references to this event from any users' createdEvents/attendedEvents
    try {
      await User.updateMany(
        { $or: [ { createdEvents: event._id }, { attendedEvents: event._id } ] },
        { $pull: { createdEvents: event._id, attendedEvents: event._id } }
      );
    } catch (e) {
      console.error('Failed to clean up user event references for event', event._id, e);
    }

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;