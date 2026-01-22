const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and Admin role
router.use(protect);
router.use(authorize('Admin'));

// @route   GET /api/admin/users/pending
// @desc    Get all pending approval users
// @access  Private (Admin)
router.get('/users/pending', async (req, res) => {
  try {
    const users = await User.find({
      profileStatus: 'Pending_Approval'
    }).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:userId/approve
// @desc    Approve or reject user
// @access  Private (Admin)
router.put('/users/:userId/approve', [
  body('decision').isIn(['Approve', 'Reject']),
  body('reason').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { decision, reason } = req.body;

    const updateData = {
      profileStatus: decision === 'Approve' ? 'Approved' : 'Rejected',
      isVerified: decision === 'Approve'
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Send email notification
    // await sendEmail(user.email, decision, reason);

    res.json({
      message: 'User Profile Updated.',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Total revenue
    const completedBookings = await Booking.find({
      status: 'Completed',
      ...dateFilter
    });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Commission (30% of total revenue)
    const commission = totalRevenue * 0.3;

    // Active bookings
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['Confirmed', 'Started', 'Pending_Driver'] }
    });

    // Total fleet
    const totalFleet = await Car.countDocuments();
    const availableFleet = await Car.countDocuments({ status: 'Available' });
    const activeFleetPercentage = totalFleet > 0 ? (availableFleet / totalFleet) * 100 : 0;

    // Total users by role
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalHosts = await User.countDocuments({ role: 'Host' });
    const totalDrivers = await User.countDocuments({ role: 'Driver' });

    // Recent bookings
    const recentBookings = await Booking.find(dateFilter)
      .populate('customerId', 'name')
      .populate('carId', 'make model')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        commission: commission.toFixed(2),
        activeBookings,
        totalFleet,
        availableFleet,
        activeFleetPercentage: activeFleetPercentage.toFixed(2),
        totalCustomers,
        totalHosts,
        totalDrivers
      },
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private (Admin)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
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

// @route   GET /api/admin/cars
// @desc    Get all cars
// @access  Private (Admin)
router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find()
      .populate('hostId', 'name email')
      .sort({ createdAt: -1 });

    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
