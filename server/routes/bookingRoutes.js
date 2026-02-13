import express from "express";
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, getOwnerBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Public availability check
bookingRouter.post('/check-availability', checkAvailabilityOfCar)

// Renter-specific actions
bookingRouter.post('/create', protect, authorizeRoles("renter"), createBooking)
bookingRouter.get('/user', protect, authorizeRoles("renter"), getUserBookings)

// Client/owner-side booking management
bookingRouter.get('/owner', protect, authorizeRoles("client", "owner", "admin"), getOwnerBookings)
bookingRouter.post('/change-status', protect, authorizeRoles("client", "owner", "admin"), changeBookingStatus)

export default bookingRouter;