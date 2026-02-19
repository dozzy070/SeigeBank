
import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  max: 10,
  statement_timeout: 30000,
  keepalives: 1,
  keepalives_idle: 30,
});

// Handle connection errors with retry logic
let retryCount = 0;
const maxRetries = 5;

pool.on("error", (err, client) => {
  console.error("❌ Connection error:", err.message);
  if (retryCount < maxRetries) {
    retryCount++;
    console.log(`Retry attempt ${retryCount}/${maxRetries}...`);
    setTimeout(testConnection, 5000);
  }
});

// Verify connection on startup with retry
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connection verified");
    retryCount = 0;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("\nDebug info:");
    console.error(`- DB_HOST: ${process.env.DB_HOST}`);
    console.error(`- DB_NAME: ${process.env.DB_NAME}`);
    console.error(`- DB_USER: ${process.env.DB_USER}`);
    console.error(`- DB_PORT: ${process.env.DB_PORT}`);
    
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying in 5 seconds (attempt ${retryCount}/${maxRetries})...`);
      setTimeout(testConnection, 5000);
    } else {
      console.error("❌ Max retries exceeded. Check your network and Aiven credentials.");
    }
  }
};

testConnection();

export default pool;
