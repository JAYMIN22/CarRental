const mongoose = require('mongoose');

const carAvailabilitySchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    enum: ['Unavailable', 'Maintenance'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient date range queries
carAvailabilitySchema.index({ carId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('CarAvailability', carAvailabilitySchema);
