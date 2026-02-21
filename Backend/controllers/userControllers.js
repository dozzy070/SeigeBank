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
   CREATE BANK ACCOUNT
========================= */
export const createBankAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId, accountType = "Savings" } = req.body;

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate unique 10-digit account number
    const generateAccountNumber = () => {
      return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };

    let accountNumber = generateAccountNumber();

    // Ensure uniqueness
    let exists = true;
    while (exists) {
      const check = await pool.query(
        "SELECT * FROM bank_accounts WHERE account_number = $1",
        [accountNumber]
      );
      if (check.rows.length === 0) exists = false;
      else accountNumber = generateAccountNumber();
    }

    // Insert bank account
    const insertQuery = `
      INSERT INTO bank_accounts (user_id, account_number, account_type, balance)
      VALUES ($1, $2, $3, $4)
      RETURNING id, account_number, account_type, balance
    `;
    const result = await pool.query(insertQuery, [userId, accountNumber, accountType, 0]);

    res.status(201).json({
      message: "Bank account created successfully",
      account: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating bank account" });
  }
};



// controllers/ADD TRANSACTION
export const addTransaction = async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;

    if (!userId || !type || !amount) {
      return res.status(400).json({ error: "userId, type, and amount are required" });
    }

    // Get user's primary bank account (for simplicity, first account)
    const accountResult = await pool.query(
      "SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY id LIMIT 1",
      [userId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: "Bank account not found for user" });
    }

    const account = accountResult.rows[0];
    let newBalance = account.balance;

    if (type === "deposit") newBalance += amount;
    else if (type === "withdraw") {
      if (amount > account.balance) return res.status(400).json({ error: "Insufficient balance" });
      newBalance -= amount;
    } else {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    // Update account balance
    await pool.query(
      "UPDATE bank_accounts SET balance = $1 WHERE id = $2",
      [newBalance, account.id]
    );

    // Record transaction
    const insertTransaction = `
      INSERT INTO transactions (user_id, account_id, type, amount, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, type, amount, description, created_at
    `;
    const transactionResult = await pool.query(insertTransaction, [
      userId,
      account.id,
      type,
      amount,
      description || null,
    ]);

    res.status(201).json({
      message: "Transaction successful",
      transaction: transactionResult.rows[0],
      newBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error processing transaction" });
  }
};

// controllers/GET USER ACCOUNT
export const getUserAccount = async (req, res) => {
  try {
    const { userId } = req.query; // ✅ FIXED

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      "SELECT * FROM bank_accounts WHERE user_id = $1",
      [userId]
    );

    res.status(200).json({ account: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching account" });
  }
};

/* =========================
   GET USER ACTIVITIES
========================= */
export const getUserActivities = async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query; // ✅ FIXED

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      `
      SELECT t.*, b.account_number
      FROM transactions t
      JOIN bank_accounts b ON t.account_id = b.id
      WHERE b.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    res.status(200).json({ activities: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching activities" });
  }
};

/* =========================
   GET USER PROFILE
========================= */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // route: /user/:userId/profile

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      `
      SELECT id, full_name, email, phone, created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching user profile" });
  }
};