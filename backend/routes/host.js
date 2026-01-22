const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const CarAvailability = require('../models/CarAvailability');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication and Host role
router.use(protect);
router.use(authorize('Host'));

// @route   POST /api/host/vehicles
// @desc    Add new vehicle
// @access  Private (Host)
router.post('/vehicles', [
  body('make').notEmpty(),
  body('model').notEmpty(),
  body('registrationNumber').notEmpty(),
  body('fuelType').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
  body('transmission').isIn(['Manual', 'Automatic']),
  body('basePrice').isNumeric().isFloat({ min: 0 }),
  body('latitude').isNumeric(),
  body('longitude').isNumeric(),
  body('city').notEmpty()
], upload.array('images', 5), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      make,
      model,
      registrationNumber,
      fuelType,
      transmission,
      basePrice,
      latitude,
      longitude,
      city,
      allowDriver
    } = req.body;

    // Check if registration number already exists
    const existingCar = await Car.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existingCar) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    // Get image URLs
    const images = req.files.map(file => 
      `${process.env.CLOUD_STORAGE_URL || 'http://localhost:5000'}/uploads/${file.filename}`
    );

    if (images.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const car = await Car.create({
      hostId: req.user.id,
      make,
      model,
      registrationNumber: registrationNumber.toUpperCase(),
      fuelType,
      transmission,
      basePrice: parseFloat(basePrice),
      images,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city
      },
      allowDriver: allowDriver === 'true' || allowDriver === true,
      status: 'Available'
    });

    res.status(201).json({
      message: 'Vehicle added successfully. It is now visible in search.',
      car
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/host/vehicles
// @desc    Get all vehicles for host
// @access  Private (Host)
router.get('/vehicles', async (req, res) => {
  try {
    const cars = await Car.find({ hostId: req.user.id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/host/vehicles/:carId/availability
// @desc    Manage vehicle availability (block dates)
// @access  Private (Host)
router.post('/vehicles/:carId/availability', [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').isIn(['Unavailable', 'Maintenance'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carId } = req.params;
    const { startDate, endDate, reason } = req.body;

    // Verify car belongs to host
    const car = await Car.findOne({ _id: carId, hostId: req.user.id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for active bookings in this date range
    const activeBookings = await Booking.find({
      carId,
      status: { $in: ['Confirmed', 'Started', 'Pending_Driver'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot block dates. Upcoming booking exists.' 
      });
    }

    // Create availability block
    await CarAvailability.create({
      carId,
      startDate: start,
      endDate: end,
      reason
    });

    res.json({
      message: 'Calendar updated. Car is offline for selected dates.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/host/bookings
// @desc    Get all bookings for host's vehicles
// @access  Private (Host)
router.get('/bookings', async (req, res) => {
  try {
    const cars = await Car.find({ hostId: req.user.id }).select('_id');
    const carIds = cars.map(car => car._id);

    const bookings = await Booking.find({ carId: { $in: carIds } })
      .populate('customerId', 'name email phone')
      .populate('driverId', 'name email phone')
      .populate('carId', 'make model registrationNumber')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
