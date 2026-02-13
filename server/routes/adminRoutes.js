import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

const adminRouter = express.Router();

// Minimal admin overview endpoint to prove admin wiring
adminRouter.get("/overview", protect, authorizeRoles("admin"), async (req, res) => {
    try {
        const [usersCount, carsCount, bookingsCount] = await Promise.all([
            User.countDocuments(),
            Car.countDocuments(),
            Booking.countDocuments(),
        ]);

        res.json({
            success: true,
            overview: {
                usersCount,
                carsCount,
                bookingsCount,
            },
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
});

export default adminRouter;

