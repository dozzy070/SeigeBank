import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import sendemailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();

const app = express(); // ✅ Create app FIRST

// =======================
// CORS Configuration
// =======================
const corsOrigins = [
  process.env.FRONTEND_URL_LOCAL || "http://localhost:5173",
  process.env.FRONTEND_URL_VERCEL || "https://new-work-ecru-two.vercel.app",
  "https://seige-bank.vercel.app",
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  })
);

// =======================
// Middleware
// =======================
app.use(express.json());

// =======================
// Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/email", sendemailRoutes);
app.use("/api/transactions", transactionRoutes);

// =======================
// Test Route
// =======================
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});