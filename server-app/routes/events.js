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
    await dbConnect();
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
      .populate('organizer', 'username firstName lastName profilePicture')
      .populate('attendees', 'username firstName lastName profilePicture')
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
      .populate('organizer', 'username firstName lastName profilePicture')
      .populate('attendees', 'username firstName lastName profilePicture')
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
      .populate('organizer', 'username firstName lastName profilePicture')
      .populate('attendees', 'username firstName lastName profilePicture');
    
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
    
    // Allow admins to delete any event, or users to delete only their own events
    let query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.organizer = req.user.userId;
    }
    
    const event = await Event.findOneAndDelete(query);
    
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

// RSVP to event (add as attendee)
router.post('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already attending event' });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendees.push(userId);
    await event.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { attendedEvents: id }
    });

    res.json({ message: 'RSVP successful', attendeeCount: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Un-RSVP from event (remove as attendee)
router.delete('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove from attendees
    event.attendees = event.attendees.filter(aid => !aid.equals(userId));
    await event.save();

    // Remove from user's attended events
    await User.findByIdAndUpdate(userId, {
      $pull: { attendedEvents: id }
    });

    res.json({ message: 'Un-RSVP successful', attendeeCount: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;