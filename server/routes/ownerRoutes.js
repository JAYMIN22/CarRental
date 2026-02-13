import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import { addCar, changeRoleToOwner, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateCarDetails, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

// Change current user role to client (legacy name: owner)
ownerRouter.post("/change-role", protect, changeRoleToOwner)

// All routes below require client/owner (car provider) or admin
ownerRouter.post("/add-car", upload.single("image"), protect, authorizeRoles("client", "owner", "admin"), addCar)
ownerRouter.get("/cars", protect, authorizeRoles("client", "owner", "admin"), getOwnerCars)
ownerRouter.post("/toggle-car", protect, authorizeRoles("client", "owner", "admin"), toggleCarAvailability)
ownerRouter.post("/delete-car", protect, authorizeRoles("client", "owner", "admin"), deleteCar)
ownerRouter.post("/update-car", protect, authorizeRoles("client", "owner", "admin"), updateCarDetails)

ownerRouter.get('/dashboard', protect, authorizeRoles("client", "owner", "admin"), getDashboardData)
ownerRouter.post('/update-image', upload.single("image"), protect, authorizeRoles("client", "owner", "admin"), updateUserImage)

export default ownerRouter;