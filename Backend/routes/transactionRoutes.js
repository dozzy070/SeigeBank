import express from "express";
import { body } from "express-validator";
import {
  addMoney,
  sendMoney,
  payBill,
  getUserAccount,
  getUserActivities,
} from "../controllers/userControllers.js";

const router = express.Router();

/* =========================
   DEPOSIT MONEY
========================= */
router.post(
  "/deposit",
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
  ],
  addMoney
);

/* =========================
   TRANSFER MONEY
========================= */
router.post(
  "/transfer",
  [
    body("userId").notEmpty().withMessage("Sender userId is required"),
    body("receiverAccountNumber").notEmpty().withMessage("Receiver account number is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
  ],
  sendMoney
);

/* =========================
   BILL PAYMENT
========================= */
router.post(
  "/bill-payment",
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("billType").notEmpty().withMessage("Bill type is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
  ],
  payBill
);

/* =========================
   GET USER ACCOUNT
========================= */
router.get("/account", getUserAccount);

/* =========================
   GET USER ACTIVITIES
========================= */
router.get("/activities", getUserActivities);

export default router;