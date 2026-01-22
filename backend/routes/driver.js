const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and Driver role
router.use(protect);
router.use(authorize('Driver'));

// @route   POST /api/driver/go-online
// @desc    Set driver status to online
// @access  Private (Driver)
router.post('/go-online', async (req, res) => {
  try {
    const { city } = req.body;
    
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: true,
      city: city || req.user.city
    });

    const io = req.app.get('io');
    const socket = io.sockets.sockets.get(req.headers.socketid);
    if (socket) {
      socket.join(`driver-${req.user.id}`);
    }

    res.json({ message: 'Driver is now online', isOnline: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/driver/go-offline
// @desc    Set driver status to offline
// @access  Private (Driver)
router.post('/go-offline', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isOnline: false });
    res.json({ message: 'Driver is now offline', isOnline: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/driver/trip-requests
// @desc    Get pending trip requests for driver's city
// @access  Private (Driver)
router.get('/trip-requests', async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    
    const bookings = await Booking.find({
      status: 'Pending_Driver',
      bookingMode: 'With Driver'
    })
      .populate({
        path: 'carId',
        match: { 'location.city': new RegExp(driver.city || '', 'i') }
      })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    // Filter out bookings with null carId (city mismatch)
    const filteredBookings = bookings.filter(b => b.carId !== null);

    const tripRequests = filteredBookings.map(booking => {
      const days = Math.ceil((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24));
      return {
        bookingId: booking._id,
        car: {
          make: booking.carId.make,
          model: booking.carId.model,
          registrationNumber: booking.carId.registrationNumber
        },
        customer: {
          name: booking.customerId.name,
          phone: booking.customerId.phone
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        days,
        earnings: booking.totalAmount * 0.7 // 70% to driver
      };
    });

    res.json(tripRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/driver/accept-trip/:bookingId
// @desc    Accept a trip request
// @access  Private (Driver)
router.post('/accept-trip/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Race condition check: Use findOneAndUpdate with status check
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: 'Pending_Driver'
      },
      {
        driverId: req.user.id,
        status: 'Confirmed'
      },
      { new: true }
    );

    if (!booking) {
      return res.status(400).json({ 
        message: 'Trip request is no longer available. Another driver may have accepted it.' 
      });
    }

    // Populate carId to get hostId
    await booking.populate('carId', 'hostId');

    // Notify customer and host via Socket.IO
    const io = req.app.get('io');
    io.to(`customer-${booking.customerId}`).emit('driver-found', {
      bookingId: booking._id,
      driver: {
        name: req.user.name,
        phone: req.user.phone
      }
    });

    if (booking.carId && booking.carId.hostId) {
      io.to(`host-${booking.carId.hostId}`).emit('trip-scheduled', {
        bookingId: booking._id
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('carId', 'make model registrationNumber');

    res.json({
      message: 'Trip Accepted! View Customer Details.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/driver/start-trip/:bookingId
// @desc    Start a trip
// @access  Private (Driver)
router.post('/start-trip/:bookingId', [
  body('odometerReading').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.params;
    const { odometerReading } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      driverId: req.user.id,
      status: 'Confirmed'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    booking.status = 'Started';
    booking.startTime = new Date();
    booking.startOdometer = parseFloat(odometerReading);
    await booking.save();

    res.json({
      message: 'Trip Started',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/driver/end-trip/:bookingId
// @desc    End a trip
// @access  Private (Driver)
router.post('/end-trip/:bookingId', [
  body('odometerReading').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.params;
    const { odometerReading } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      driverId: req.user.id,
      status: 'Started'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not in started state' });
    }

    const endOdometer = parseFloat(odometerReading);
    const kmsDriven = endOdometer - (booking.startOdometer || 0);
    
    // Calculate extra charges (assuming 100km/day included, ₹10/km extra)
    const days = Math.ceil((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24));
    const includedKms = days * 100;
    const extraKms = Math.max(0, kmsDriven - includedKms);
    const extraKmCharges = extraKms * 10;

    // Check for late return (assuming 1 hour grace period)
    const now = new Date();
    const lateHours = Math.max(0, (now - booking.endDate) / (1000 * 60 * 60));
    const lateFees = lateHours > 1 ? Math.ceil(lateHours - 1) * 500 : 0; // ₹500 per hour

    booking.status = 'Completed';
    booking.endTime = now;
    booking.endOdometer = endOdometer;
    booking.extraKms = extraKms;
    booking.extraKmCharges = extraKmCharges;
    booking.lateFees = lateFees;
    booking.totalAmount = booking.basePrice + extraKmCharges + lateFees;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('carId', 'make model registrationNumber');

    res.json({
      message: 'Trip Ended. Payment Summary generated.',
      booking: populatedBooking,
      summary: {
        basePrice: booking.basePrice,
        extraKms,
        extraKmCharges,
        lateFees,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/driver/my-trips
// @desc    Get all trips for driver
// @access  Private (Driver)
router.get('/my-trips', async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user.id })
      .populate('customerId', 'name email phone')
      .populate('carId', 'make model registrationNumber images')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
