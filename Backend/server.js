import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import sendemailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();

// CORS Configuration using environment variables
const corsOrigins = [
  process.env.FRONTEND_URL_LOCAL || 'http://localhost:5173',
  process.env.FRONTEND_URL_VERCEL || 'https://new-work-ecru-two.vercel.app',
  'https://seige-bank.vercel.app' // Added new Vercel domain
];

// Middleware
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/user", userRoutes);

// Email routes
app.use("/api/email", sendemailRoutes);

// Test route
app.get("/", (req, res) => res.send("Backend running 🚀"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
