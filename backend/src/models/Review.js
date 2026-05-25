const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  name: String,
  text: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);