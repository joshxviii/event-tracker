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
        const reviewData = { ...req.body };

        const review = new Review(reviewData);
        await review.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a review (only the author can delete)
router.delete('/:reviewId', async (req, res) => {
    try {
        const reviewId = req.params.reviewId;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
