// Event Related Routes
const express = require('express');
const router = express.Router();
const Event = require('../schemas/Event');
const auth = require('../middleware/auth'); //TODO

// Create event (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user.userId };
    const event = new Event(eventData);
    await event.save();

    // Add to organizer's created events
    await Event.findByIdAndUpdate(req.user.userId, {
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

// Update event (only organizer)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      organizer: req.user.userId 
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

// Delete event (only organizer)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      organizer: req.user.userId 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;