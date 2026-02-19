import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import sendemailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173' , 'https://new-work-ecru-two.vercel.app/'], credentials: true }));
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
