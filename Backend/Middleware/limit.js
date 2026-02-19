import rateLimit from "express-rate-limit";

const loginAttempts = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: {
    status: 429,
    error: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,  // Disable the X-RateLimit-* headers
});

export default loginAttempts;
