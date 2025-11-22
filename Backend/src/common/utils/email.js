import nodemailer from 'nodemailer';
import { logger } from '../logger/logger.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

export const sendOtpEmail = async (email, otp, type) => {
  try {
    let subject, html;

    if (type === 'signup') {
      subject = 'StockMaster - Verify Your Email';
      html = `<h2>Welcome to StockMaster!</h2><p>Your OTP: <h1>${otp}</h1></p><p>Expires in 10 minutes.</p>`;
    } else if (type === 'password_reset') {
      subject = 'StockMaster - Password Reset OTP';
      html = `<h2>Password Reset</h2><p>Your OTP: <h1>${otp}</h1></p><p>Expires in 10 minutes.</p>`;
    }

    // Log OTP for development (remove in production)
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);
    logger.info(`OTP generated for ${email}: ${otp}`);

    const mailOptions = {
      from: process.env.SENDER_EMAIL || 'noreply@stockmaster.com',
      to: email,
      subject,
      html,
    };

    // Try to send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${email}`);
    } else {
      logger.warn(`SendGrid not configured, OTP logged to console only`);
    }
  } catch (error) {
    logger.error(`Failed to send email to ${email}`, error);
  }
};
