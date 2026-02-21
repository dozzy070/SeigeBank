import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import pool from "../config/db.js";
import {
  sendRegisterEmail,
  sendLoginAlertEmail,
  sendResetEmail,
} from "../Utils/email.js";
import { generateResetToken } from "../Utils/tokenUtils.js";
import { generateAccountNumber, formatCurrency } from "../Utils/accountUtils.js";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    username,
    fullname,
    email,
    password,
    phone,
    dob,
    govId,
    taxNumber,
    passportId,
    nextOfKinName,
    nextOfKinPhone,
    contactDetails,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = `
      INSERT INTO users(
        username, fullname, email, password, phone, dob,
        gov_id, tax_number, passport_id, next_of_kin_name,
        next_of_kin_phone, contact_details
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, username, fullname, email, phone
    `;

    const userResult = await pool.query(insertUserQuery, [
      username,
      fullname || null,
      email,
      hashedPassword,
      phone || null,
      dob || null,
      govId || null,
      taxNumber || null,
      passportId || null,
      nextOfKinName || null,
      nextOfKinPhone || null,
      contactDetails || null,
    ]);

    const newUser = userResult.rows[0];

    const accountNumber = generateAccountNumber();
    const createAccountQuery = `
      INSERT INTO accounts(user_id, account_number, account_type, balance, currency)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, account_number, account_type, balance, currency, created_at, updated_at
    `;

    const accountResult = await pool.query(createAccountQuery, [
      newUser.id,
      accountNumber,
      "Checking",
      0.0,
      "NGN",
    ]);

    const newAccount = accountResult.rows[0];

    sendRegisterEmail(email);

    res.status(201).json({
      message: "User registered",
      user: newUser,
      account: newAccount,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        errors: [{ msg: "Email already registered" }],
      });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    sendLoginAlertEmail({
      to: user.email,
      location: req.ip || "Unknown location",
      device: req.headers["user-agent"] || "Unknown device",
      dateTime: new Date().toLocaleString(),
    }).catch((err) => console.error("sendLoginAlertEmail error:", err));

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const user = result.rows[0];
    const { resetToken, hashedToken, expires } = generateResetToken();

    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expires = $2
       WHERE id = $3`,
      [hashedToken, expires, user.id]
    );

    await sendResetEmail(user.email, resetToken);

    res.json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      `SELECT id FROM users
       WHERE reset_token = $1
       AND reset_token_expires > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   (Everything below remains unchanged)
========================= */