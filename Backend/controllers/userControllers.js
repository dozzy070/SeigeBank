
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";
import qs from "qs";
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

    // Create a primary bank account for the user automatically
    const accountNumber = generateAccountNumber();
    const createAccountQuery = `
      INSERT INTO accounts(user_id, account_number, account_type, balance, currency)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, account_number, account_type, balance, currency, created_at, updated_at
    `;

    const accountResult = await pool.query(createAccountQuery, [
      newUser.id,
      accountNumber,
      'Checking',
      0.0,
      'NGN',
    ]);

    const newAccount = accountResult.rows[0];

    // Fire-and-forget welcome email
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
  const { email, password, captchaToken } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (!captchaToken) {
      return res.status(400).json({ error: "CAPTCHA token is required" });
    }

    // =========================
    // Verify hCaptcha
    // =========================
    const captchaResponse = await axios.post(
      "https://hcaptcha.com/siteverify",
      qs.stringify({
        secret: process.env.HCAPTCHA_SECRET_KEY,
        response: captchaToken,
        remoteip: req.ip,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!captchaResponse.data.success) {
      console.log("hCaptcha failed:", captchaResponse.data);
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // =========================
    // Check user in database
    // =========================
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // =========================
    // Send login emails asynchronously (do not block response)
    // =========================
    sendLoginEmail(user.email).catch((err) =>
      console.error("sendLoginEmail error:", err)
    );
    sendLoginAlertEmail({
      to: user.email,
      location: req.ip || "Unknown location",
      device: req.headers["user-agent"] || "Unknown device",
      dateTime: new Date().toLocaleString(),
    }).catch((err) => console.error("sendLoginAlertEmail error:", err));

    // =========================
    // Return user info
    // =========================
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
   GET USER PROFILE
========================= */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================
   CREATE BANK ACCOUNT
========================= */
export const createBankAccount = async (req, res) => {
  try {
    const { userId, accountType = "Checking" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user exists
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has an account
    const accountCheck = await pool.query(
      "SELECT id FROM accounts WHERE user_id = $1",
      [userId]
    );

    if (accountCheck.rows.length > 0) {
      return res.status(400).json({ error: "User already has an account" });
    }

    // Generate unique account number
    const accountNumber = generateAccountNumber();

    // Create account
    const result = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, account_number, account_type, balance, currency, created_at`,
      [userId, accountNumber, accountType, 0.0]
    );

    // Log account creation activity
    const account = result.rows[0];
    await pool.query(
      `INSERT INTO activities (user_id, account_id, activity_type, description, amount, balance_after, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, account.id, "account_opened", "Account created", 0, 0, "completed"]
    );

    res.status(201).json({
      message: "Bank account created successfully",
      account: {
        ...account,
        balance: parseFloat(account.balance),
      },
    });
  } catch (err) {
    console.error("Create account error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET USER ACCOUNT
========================= */
export const getUserAccount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log('Getting account for userId:', userId);

    const result = await pool.query(
      `SELECT id, user_id, account_number, account_type, balance, currency, created_at, updated_at
       FROM accounts WHERE user_id = $1`,
      [userId]
    );

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No account found for this user" });
    }

    const account = result.rows[0];

    res.status(200).json({
      account: {
        id: account.id,
        user_id: account.user_id,
        account_number: account.account_number,
        account_type: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency,
        created_at: account.created_at,
        updated_at: account.updated_at,
        formattedBalance: formatCurrency(parseFloat(account.balance), account.currency),
      },
    });
  } catch (err) {
    console.error("Get account error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

/* =========================
   GET USER ACTIVITIES
========================= */
export const getUserActivities = async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate that user exists
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get activities for the user
    const result = await pool.query(
      `SELECT id, activity_type, description, amount, balance_after, timestamp, status
       FROM activities
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM activities WHERE user_id = $1",
      [userId]
    );

    res.status(200).json({
      activities: result.rows.map(activity => ({
        ...activity,
        amount: activity.amount ? parseFloat(activity.amount) : null,
        balance_after: activity.balance_after ? parseFloat(activity.balance_after) : null,
        formattedAmount: activity.amount ? formatCurrency(activity.amount) : null,
      })),
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error("Get activities error:", err.message);
    res.status(500).json({ error: "Failed to fetch activities", details: err.message });
  }
};

/* =========================
   ADD TRANSACTION
========================= */
export const addTransaction = async (req, res) => {
  try {
    const { userId, accountId, type, description, amount } = req.body;

    if (!userId || !accountId || !type || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current balance
    const accountResult = await pool.query(
      "SELECT balance FROM accounts WHERE id = $1 AND user_id = $2",
      [accountId, userId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const currentBalance = parseFloat(accountResult.rows[0].balance);
    const transactionAmount = type === "withdrawal" ? -Math.abs(amount) : Math.abs(amount);
    const newBalance = currentBalance + transactionAmount;

    // Validate sufficient balance for withdrawal
    if (type === "withdrawal" && newBalance < 0) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update account balance
    await pool.query(
      "UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2",
      [newBalance, accountId]
    );

    // Log activity
    const activityResult = await pool.query(
      `INSERT INTO activities (user_id, account_id, activity_type, description, amount, balance_after, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, activity_type, description, amount, balance_after, timestamp, status`,
      [userId, accountId, type, description, transactionAmount, newBalance, "completed"]
    );

    res.status(201).json({
      message: "Transaction completed successfully",
      activity: {
        ...activityResult.rows[0],
        amount: parseFloat(activityResult.rows[0].amount),
        balance_after: parseFloat(activityResult.rows[0].balance_after),
      },
    });
  } catch (err) {
    console.error("Add transaction error:", err);
    res.status(500).json({ error: err.message });
  }
};
