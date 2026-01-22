const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bookingMode: {
    type: String,
    enum: ['Self-Drive', 'With Driver'],
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
  status: {
    type: String,
    enum: ['Pending_Driver', 'Confirmed', 'Started', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  },
  basePrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  keyCode: {
    type: String,
    default: null
  },
  startOdometer: {
    type: Number,
    default: null
  },
  endOdometer: {
    type: Number,
    default: null
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  lateFees: {
    type: Number,
    default: 0
  },
  extraKms: {
    type: Number,
    default: 0
  },
  extraKmCharges: {
    type: Number,
    default: 0
  },
  lockExpiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
bookingSchema.index({ carId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ driverId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
