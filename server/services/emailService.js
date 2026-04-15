import transporter from '../config/email.js';
import env from '../config/env.js';

/**
 * Sends an email using the configured SMTP transporter.
 * In development mode, logs email content to console instead of sending.
 * Never throws — email failures must not break the main operation.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (env.NODE_ENV === 'development') {
      console.log('\n📧 [DEV] Email would be sent:');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   HTML: ${html.substring(0, 200)}...`);
      return { success: true };
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
    return { success: false };
  }
};

export default sendEmail;
