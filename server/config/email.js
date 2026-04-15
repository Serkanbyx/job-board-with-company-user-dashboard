import nodemailer from 'nodemailer';
import env from './env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Verifies SMTP connection at startup.
 * Logs result but never blocks server start.
 */
export const verifyConnection = async () => {
  try {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      console.log('📧 Email service not configured — emails disabled');
      return false;
    }

    await transporter.verify();
    console.log('📧 Email service connected');
    return true;
  } catch (error) {
    console.error('📧 Email service connection failed:', error.message);
    return false;
  }
};

export default transporter;
