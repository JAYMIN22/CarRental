import Booking from "../models/Booking.js";

// API: Get bookings that need a driver and have no driver assigned yet (available jobs)
export const getAvailableJobs = async (req, res) => {
    try {
        const jobs = await Booking.find({
            needsDriver: true,
            driver: null,
            status: { $in: ["pending", "confirmed"] }
        })
            .populate("car")
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, jobs });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API: Get bookings assigned to the logged-in driver
export const getDriverBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ driver: _id })
            .populate("car")
            .populate("user", "name email")
            .sort({ pickupDate: 1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API: Driver accepts a booking (assigns themselves to it)
export const acceptBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }
        if (!booking.needsDriver) {
            return res.json({ success: false, message: "This booking does not require a driver" });
        }
        if (booking.driver) {
            return res.json({ success: false, message: "This booking already has a driver" });
        }
        if (booking.status === "cancelled") {
            return res.json({ success: false, message: "Booking is cancelled" });
        }

        booking.driver = _id;
        await booking.save();

        res.json({ success: true, message: "Booking accepted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API: Driver cancels/unassigns an accepted job
export const cancelDriverJob = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        if (!booking.driver || booking.driver.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        if (booking.status === "cancelled") {
            return res.json({ success: false, message: "Booking is already cancelled" });
        }

        // Unassign driver but keep booking active so another driver can accept
        booking.driver = null;
        await booking.save();

        res.json({ success: true, message: "You have been unassigned from this booking" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
