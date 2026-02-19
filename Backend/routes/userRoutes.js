
import express from "express";
import { resetPassword, forgotPassword, registerUser, loginUser, getUserProfile, getUserAccount, getUserActivities, addTransaction } from "../controllers/userControllers.js";

const router = express.Router();

// User authentication routes
router.post("/register", registerUser);
router.get("/profile", getUserProfile);
router.post("/login", loginUser);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); // ✅ Reset password endpoint

// Bank account routes
router.get("/account", getUserAccount);
router.get("/activities", getUserActivities);
router.post("/transaction", addTransaction);

export default router;
