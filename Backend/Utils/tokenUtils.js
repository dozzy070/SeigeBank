import crypto from "crypto";

/**
 * Generates a password reset token
 * @returns {Object} resetToken - plain token for email
 *                   hashedToken - hashed token for DB
 *                   expires - expiry date
 */
export const generateResetToken = () => {
  // 1️⃣ Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2️⃣ Hash token for storage in DB
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // 3️⃣ Set expiration (15 minutes)
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  return { resetToken, hashedToken, expires };
};
