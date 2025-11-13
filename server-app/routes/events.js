// Event Related Routes
const express = require('express');
const router = express.Router();
const Event = require('../schemas/Event');
const User = require('../schemas/User');
const { requireAuth } = require('../middleware/auth');
const { dbConnect } = require('../middleware/mongoose');


// Create event (authenticated)
router.post('/', requireAuth, async (req, res) => {
  try {
    await dbConnect;
    const eventData = { ...req.body };
    eventData.organizer = req.user.userId;

    const event = new Event(eventData);
    await event.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { createdEvents: event._id }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const events = await Event.find()
      .populate('organizer', 'username firstName lastName')
      .populate('attendees', 'username firstName lastName')
      .sort({ startAt: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events organized by a specific user
router.get('/organizer/:userId', async (req, res) => {
  try {
    await dbConnect();
    const events = await Event.find({ organizer: req.params.userId })
      .populate('organizer', 'username firstName lastName')
      .populate('attendees', 'username firstName lastName')
      .sort({ startAt: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
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
router.put('/:id', requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const eventData = { ...req.body };

    // Prevent client from changing the organizer field
    if (eventData.organizer) delete eventData.organizer;

    const event = await Event.findOne({ 
      _id: req.params.id, 
      organizer: req.user.userId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized. UPDATE' });
    }
    
    Object.assign(event, eventData);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      organizer: req.user.userId 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized. DELETE' });
    }

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

//Favorite/Unfavorite event
router.post('/:id/favorite', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const user = await User.findById(userId);
  const isFav = user.favoriteEvents.includes(id);

  if (isFav) {
    await User.updateOne({ _id: userId }, { $pull: { favoriteEvents: id } });
  } else {
    await User.updateOne({ _id: userId }, { $addToSet: { favoriteEvents: id } });
  }

  res.json({ isFavorite: !isFav });
});

module.exports = router;