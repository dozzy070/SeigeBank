
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   MAIL TRANSPORTER
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password if 2FA enabled
  },
});

/* =========================
   LOGIN ALERT EMAIL
========================= */
export const sendLoginAlertEmail = async ({ to, location, device, dateTime }) => {
  try {
    await transporter.sendMail({
      from: `"Seige Bank Security Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: "New Login Detected",
      html: `
        <p>Hello ${to.split("@")[0]},</p>
        <p>You have successfully logged in to your account from location:</p>
        <p>
          <strong>Location:</strong> ${location}<br/>
          <strong>Device:</strong> ${device}<br/>
          <strong>Date & Time:</strong> ${dateTime}
        </p>
        <p>If this was you, no action is needed.</p>
        <p>If you do not recognize this activity, please contact us immediately.</p>
        <p>Best regards,<br/><strong>Seige Bank Security Team</strong></p>
      `,
    });
    console.log(`Login alert email sent to ${to}`);
  } catch (err) {
    console.error("Error sending login alert email:", err);
  }
};

/* =========================
   REGISTRATION / WELCOME EMAIL
========================= */
export const sendRegisterEmail = async (toEmail) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const registrationLink = `${frontendUrl}/register`;

  try {
    await transporter.sendMail({
      from: `"EastPal Bank Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Welcome to EastPal Bank 👋 – Activate Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #0b3d91;">Welcome to EastPal Bank</h2>
          <p>Dear Customer,</p>
          <p>Thank you for choosing EastPal Bank. We are committed to providing you with a secure and seamless banking experience.</p>
          <p>To activate your account and complete your registration, please click the button below:</p>
          <p style="text-align: center;">
            <a href="${registrationLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0b3d91; color: #fff; text-decoration: none; border-radius: 5px;">
               Activate Your Account
            </a>
          </p>
          <p>If the button does not work, copy & paste this link into your browser:</p>
          <p>${registrationLink}</p>
          <p>We are excited to have you on board and look forward to serving your financial needs.</p>
          <p>Best regards,<br/><strong>EastPal Bank Team</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message from EastPal Bank. Please do not reply to this email.
          </p>
        </div>
      `,
    });
    console.log(`Registration email sent to ${toEmail}`);
  } catch (err) {
    console.error("Error sending registration email:", err);
  }
};

/* =========================
   RESET PASSWORD EMAIL
========================= */
export const sendResetEmail = async (toEmail, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: `"EastPal Bank Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Reset Your Password 🔐",
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#d9534f;color:#fff;text-decoration:none;border-radius:5px;">
            👉 Reset your password
          </a>
        </p>
        <p>This link expires in <strong>15 minutes</strong>.</p>
        <p>If the button doesn’t work, copy & paste this link: ${resetUrl}</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `,
    });
    console.log(`Reset password email sent to ${toEmail}`);
  } catch (err) {
    console.error("Error sending reset password email:", err);
  }
};
