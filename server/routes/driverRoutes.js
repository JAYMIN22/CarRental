import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import { getAvailableJobs, getDriverBookings, acceptBooking, cancelDriverJob } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.get("/me", protect, authorizeRoles("driver", "admin"), (req, res) => {
    res.json({
        success: true,
        driver: {
            id: req.user._id,
            name: req.user.name,
            role: req.user.role,
        },
    });
});

driverRouter.get("/available-jobs", protect, authorizeRoles("driver", "admin"), getAvailableJobs);
driverRouter.get("/my-bookings", protect, authorizeRoles("driver", "admin"), getDriverBookings);
driverRouter.post("/accept-booking", protect, authorizeRoles("driver", "admin"), acceptBooking);
driverRouter.post("/cancel-job", protect, authorizeRoles("driver", "admin"), cancelDriverJob);

export default driverRouter;

