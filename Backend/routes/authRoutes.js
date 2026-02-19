
import express from "express";
import { body } from "express-validator";
import loginAttempts from "../Middleware/limit.js"; // ✅ Import correctly

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  createBankAccount,
} from "../controllers/userControllers.js";

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  registerUser
);

/* =========================
   LOGIN
========================= */
router.post(
  "/login",
  loginAttempts, // ✅ Rate limiter FIRST
  loginUser
);

/* =========================
   FORGOT PASSWORD
========================= */
router.post("/forgot-password", forgotPassword);

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password", resetPassword);

/* =========================
   CREATE BANK ACCOUNT
========================= */
router.post(
  "/create-account",
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("accountType").optional().isString().withMessage("Account type must be a string"),
  ],
  createBankAccount
);

export default router;
