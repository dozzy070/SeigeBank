import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import pool from "../config/db.js";
import { sendRegisterEmail, sendLoginAlertEmail } from "../Utils/email.js";
import { generateAccountNumber } from "../Utils/accountUtils.js";

/* =========================
   REGISTER USER + AUTO CREATE ACCOUNT
========================= */
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, fullname, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (username, fullname, email, password, phone)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, username, fullname, email, phone`,
      [username, fullname || null, email, hashedPassword, phone || null]
    );
    const newUser = userResult.rows[0];

    // Generate unique account number
    let accountNumber = generateAccountNumber();
    let exists = true;
    while (exists) {
      const check = await pool.query("SELECT * FROM accounts WHERE account_number = $1", [accountNumber]);
      if (check.rows.length === 0) exists = false;
      else accountNumber = generateAccountNumber();
    }

    // Create account
    const accountResult = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, currency)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [newUser.id, accountNumber, "Checking", 0.0, "NGN"]
    );

    sendRegisterEmail(email);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      account: accountResult.rows[0],
    });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ errors: [{ msg: "Email already registered" }] });
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
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    sendLoginAlertEmail({
      to: user.email,
      location: req.ip || "Unknown",
      device: req.headers["user-agent"] || "Unknown",
      dateTime: new Date().toLocaleString(),
    }).catch(console.error);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   ADD MONEY (DEPOSIT)
========================= */
export const addMoney = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: "userId and amount required" });

    const accountResult = await pool.query(
      "SELECT * FROM accounts WHERE user_id = $1 ORDER BY id LIMIT 1",
      [userId]
    );
    if (accountResult.rows.length === 0)
      return res.status(404).json({ error: "Account not found" });

    const account = accountResult.rows[0];
    const newBalance = parseFloat(account.balance) + parseFloat(amount);

    await pool.query("UPDATE accounts SET balance = $1 WHERE id = $2", [newBalance, account.id]);

    const transactionResult = await pool.query(
      `INSERT INTO transactions (user_id, account_id, type, amount)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [userId, account.id, "deposit", amount]
    );

    res.status(201).json({ message: "Deposit successful", transaction: transactionResult.rows[0], newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error adding money" });
  }
};

/* =========================
   SEND MONEY (TRANSFER)
========================= */
export const sendMoney = async (req, res) => {
  try {
    const { userId, receiverAccountNumber, amount } = req.body;
    if (!userId || !receiverAccountNumber || !amount)
      return res.status(400).json({ error: "userId, receiverAccountNumber, and amount required" });

    const senderResult = await pool.query(
      "SELECT * FROM accounts WHERE user_id = $1 ORDER BY id LIMIT 1",
      [userId]
    );
    if (senderResult.rows.length === 0)
      return res.status(404).json({ error: "Sender account not found" });

    const sender = senderResult.rows[0];

    const receiverResult = await pool.query(
      "SELECT * FROM accounts WHERE account_number = $1",
      [receiverAccountNumber]
    );
    if (receiverResult.rows.length === 0)
      return res.status(404).json({ error: "Receiver account not found" });

    const receiver = receiverResult.rows[0];

    if (parseFloat(sender.balance) < parseFloat(amount))
      return res.status(400).json({ error: "Insufficient funds" });

    const newSenderBalance = parseFloat(sender.balance) - parseFloat(amount);
    const newReceiverBalance = parseFloat(receiver.balance) + parseFloat(amount);

    await pool.query("UPDATE accounts SET balance=$1 WHERE id=$2", [newSenderBalance, sender.id]);
    await pool.query("UPDATE accounts SET balance=$1 WHERE id=$2", [newReceiverBalance, receiver.id]);

    const transactionResult = await pool.query(
      `INSERT INTO transactions (user_id, account_id, type, amount, description)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, sender.id, "transfer", amount, `Sent to ${receiverAccountNumber}`]
    );

    res.status(201).json({
      message: "Transfer successful",
      transaction: transactionResult.rows[0],
      newSenderBalance,
      newReceiverBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error sending money" });
  }
};

/* =========================
   PAY BILL
========================= */
export const payBill = async (req, res) => {
  try {
    const { userId, billType, amount } = req.body;
    if (!userId || !billType || !amount)
      return res.status(400).json({ error: "userId, billType, and amount required" });

    const accountResult = await pool.query(
      "SELECT * FROM accounts WHERE user_id = $1 ORDER BY id LIMIT 1",
      [userId]
    );
    if (accountResult.rows.length === 0)
      return res.status(404).json({ error: "Account not found" });

    const account = accountResult.rows[0];

    if (parseFloat(account.balance) < parseFloat(amount))
      return res.status(400).json({ error: "Insufficient funds" });

    const newBalance = parseFloat(account.balance) - parseFloat(amount);

    await pool.query("UPDATE accounts SET balance=$1 WHERE id=$2", [newBalance, account.id]);

    const transactionResult = await pool.query(
      `INSERT INTO transactions (user_id, account_id, type, amount, description)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, account.id, "bill", amount, `Bill: ${billType}`]
    );

    res.status(201).json({ message: "Bill paid successfully", transaction: transactionResult.rows[0], newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error paying bill" });
  }
};

/* =========================
   GET USER ACCOUNT
========================= */
export const getUserAccount = async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await pool.query("SELECT * FROM accounts WHERE user_id=$1", [userId]);
    res.status(200).json({ account: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching account" });
  }
};

/* =========================
   GET USER PROFILE
========================= */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const result = await pool.query(
      "SELECT id, username, fullname, email, phone, created_at FROM users WHERE id=$1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching user profile" });
  }
};

/* =========================
   GET USER ACTIVITIES
========================= */
export const getUserActivities = async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    const result = await pool.query(
      `SELECT t.*, a.account_number
       FROM transactions t
       JOIN accounts a ON t.account_id = a.id
       WHERE a.user_id=$1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    res.status(200).json({ activities: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching activities" });
  }
};

/* =========================
   GENERIC ADD TRANSACTION
========================= */
export const addTransaction = async (req, res) => {
  const { userId, type, amount, description } = req.body;
  try {
    const accountResult = await pool.query("SELECT * FROM accounts WHERE user_id=$1 LIMIT 1", [userId]);
    if (!accountResult.rows[0]) return res.status(404).json({ error: "Account not found" });

    const account = accountResult.rows[0];

    let newBalance = parseFloat(account.balance);
    if (type === "deposit" || type === "bill" || type === "transfer") {
      newBalance += parseFloat(amount);
    }

    await pool.query("UPDATE accounts SET balance=$1 WHERE id=$2", [newBalance, account.id]);

    const result = await pool.query(
      `INSERT INTO transactions(user_id, account_id, type, amount, description)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [userId, account.id, type, amount, description || ""]
    );

    res.status(201).json({ message: "Transaction added", transaction: result.rows[0], newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD (STUB)
========================= */
export const forgotPassword = async (req, res) => {
  res.status(200).json({ message: "Password reset email sent (stub)" });
};

/* =========================
   RESET PASSWORD (STUB)
========================= */
export const resetPassword = async (req, res) => {
  res.status(200).json({ message: "Password has been reset (stub)" });
};