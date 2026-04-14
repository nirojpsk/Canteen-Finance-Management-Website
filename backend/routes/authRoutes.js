import express from 'express';
import protect from "../middlewares/authMiddleware.js";
import {
loginAdmin,
logoutAdmin,
changeAdminPassword,
updateAdminProfile,
getAdminProfile,
} from "../controllers/authController.js";

const router = express.Router();

//PUBLIC ROUTES
router.post("/login", loginAdmin);

//PRIVATE ROUTES
router.post("/logout", protect, logoutAdmin);
router.get("/me", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);
router.put("/change-password", protect, changeAdminPassword);

export default router;