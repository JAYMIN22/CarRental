const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const CarAvailability = require('../models/CarAvailability');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and Customer role
router.use(protect);
router.use(authorize('Customer'));

// @route   GET /api/customer/search
// @desc    Search available vehicles
// @access  Private (Customer)
router.get('/search', async (req, res) => {
  try {
    const { location, startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Base query
    let query = { status: 'Available' };

    // Filter by location (city)
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    // Filter by driver availability if type is "With Driver"
    if (type === 'With Driver') {
      query.allowDriver = true;
    }

    // Get all cars matching base criteria
    let cars = await Car.find(query);

    // Filter out cars with blocked dates
    const blockedCars = await CarAvailability.find({
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    }).select('carId');

    const blockedCarIds = blockedCars.map(b => b.carId.toString());
    cars = cars.filter(car => !blockedCarIds.includes(car._id.toString()));

    // Filter out cars with existing bookings (overlap check)
    const existingBookings = await Booking.find({
      status: { $in: ['Confirmed', 'Started', 'Pending_Driver'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    }).select('carId');

    const bookedCarIds = existingBookings.map(b => b.carId.toString());
    cars = cars.filter(car => !bookedCarIds.includes(car._id.toString()));

    // Calculate estimated cost for each car
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const results = cars.map(car => ({
      ...car.toObject(),
      estimatedCost: car.basePrice * days,
      days
    }));

    res.json({
      results,
      count: results.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/customer/bookings
// @desc    Create new booking
// @access  Private (Customer)
router.post('/bookings', [
  body('carId').notEmpty(),
  body('bookingMode').isIn(['Self-Drive', 'With Driver']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carId, bookingMode, startDate, endDate, paymentId } = req.body;

    // Re-check availability (Optimistic Locking)
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for blocked dates
    const blocked = await CarAvailability.findOne({
      carId,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (blocked) {
      return res.status(400).json({ message: 'Car is not available for selected dates' });
    }

    // Check for existing bookings
    const existingBooking = await Booking.findOne({
      carId,
      status: { $in: ['Confirmed', 'Started', 'Pending_Driver'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Car is already booked for selected dates' });
    }

    // Get car details
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (bookingMode === 'With Driver' && !car.allowDriver) {
      return res.status(400).json({ message: 'This car does not support driver service' });
    }

    // Calculate total amount
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const basePrice = car.basePrice * days;
    const totalAmount = basePrice;

    // Generate key code for self-drive
    let keyCode = null;
    if (bookingMode === 'Self-Drive') {
      keyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Create booking
    const booking = await Booking.create({
      customerId: req.user.id,
      carId,
      bookingMode,
      startDate: start,
      endDate: end,
      basePrice,
      totalAmount,
      paymentId: paymentId || 'test_payment_' + Date.now(),
      paymentStatus: 'Completed',
      status: bookingMode === 'Self-Drive' ? 'Confirmed' : 'Pending_Driver',
      keyCode,
      lockExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes lock
    });

    // If With Driver, broadcast to drivers via Socket.IO
    if (bookingMode === 'With Driver') {
      const io = req.app.get('io');
      io.emit('new-trip-request', {
        bookingId: booking._id,
        car: {
          make: car.make,
          model: car.model,
          registrationNumber: car.registrationNumber
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        days,
        earnings: totalAmount * 0.7, // 70% to driver, 30% commission
        city: car.location.city
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('carId', 'make model registrationNumber images')
      .populate('customerId', 'name email phone');

    const response = {
      booking: populatedBooking,
      message: bookingMode === 'Self-Drive' 
        ? `Booking Confirmed. Here is your key code: ${keyCode}`
        : 'Booking Placed. Searching for a driver...'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customer/bookings
// @desc    Get all bookings for customer
// @access  Private (Customer)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('carId', 'make model registrationNumber images')
      .populate('driverId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
