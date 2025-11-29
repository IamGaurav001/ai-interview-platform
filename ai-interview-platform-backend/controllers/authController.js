import User from "../models/User.js";
import nodemailer from "nodemailer";
import admin from "../config/firebaseAdmin.js";

export const syncUser = async (req, res) => {
  try {
    const user = req.user;

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        firebaseUid: user.firebaseUid,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
        lastLoginAt: user.lastLoginAt,
        usage: user.usage,
      },
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ success: false, message: "User email not found" });
    }

    // Generate verification link using Firebase Admin SDK
    let link = await admin.auth().generateEmailVerificationLink(email);

    // Use custom domain if configured
    if (process.env.AUTH_DOMAIN) {
      const url = new URL(link);
      link = link.replace(url.hostname, process.env.AUTH_DOMAIN);
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP Connection Error:", verifyError);
      return res.status(500).json({ success: false, message: "SMTP Connection failed", error: verifyError.message });
    }

    // Email Template
    const mailOptions = {
      from: `"PrepHire Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email for PrepHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">PrepHire</h1>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Verify your email address</h2>
            <p style="color: #475569; line-height: 1.6;">
              Thanks for signing up for PrepHire! We're excited to have you on board.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Please verify your email address to get access to all features, including AI interviews and detailed feedback.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #475569; font-size: 14px;">
              If the button above doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            &copy; ${new Date().getFullYear()} PrepHire. All rights reserved.
          </div>
        </div>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Send verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    });
  }
};

export const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Generate password reset link using Firebase Admin SDK
    let link = await admin.auth().generatePasswordResetLink(email);
    
    // Use custom domain if configured
    if (process.env.AUTH_DOMAIN) {
      const url = new URL(link);
      link = link.replace(url.hostname, process.env.AUTH_DOMAIN);
    }
    
    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email Template
    const mailOptions = {
      from: `"PrepHire Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your password for PrepHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">PrepHire</h1>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Reset your password</h2>
            <p style="color: #475569; line-height: 1.6;">
              We received a request to reset the password for your PrepHire account.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #475569; font-size: 14px;">
              If you didn't ask to reset your password, you can ignore this email.
            </p>
            <p style="color: #475569; font-size: 14px;">
              If the button above doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            &copy; ${new Date().getFullYear()} PrepHire. All rights reserved.
          </div>
        </div>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Send password reset email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
      error: error.message,
    });
  }
};

