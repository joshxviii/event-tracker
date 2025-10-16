const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

reviewSchema.index({ event: 1 });

module.exports = mongoose.model('Review', reviewSchema);
