const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../schemas/Review');

// Get All Reviews for an Event
router.get('/', async (req, res) => {
    try {
        const eventId = req.params.id;
        const reviews = await Review.find({ event: eventId }).populate('author', 'username firstName lastName').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a Review for an Event
router.post('/', async (req, res) => {
    try {
        const eventId = req.params.id;
        const authorId = req.user && req.user.userId;
        if (!authorId) return res.status(401).json({ message: 'Authentication required' });

        const { rating, text } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

        const review = new Review({ event: eventId, author: authorId, rating, text });
        await review.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
