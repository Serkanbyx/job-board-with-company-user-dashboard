import baseTemplate from './baseTemplate.js';

/**
 * Generates a password reset email containing a time-limited reset link.
 * @param {object} user - Recipient user document.
 * @param {string} resetUrl - Fully-qualified reset URL with embedded token.
 * @param {number} expiresInMinutes - Link validity window, for display.
 */
const passwordResetEmail = (user, resetUrl, expiresInMinutes = 15) => {
  const name = user.firstName || 'there';

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px; color:#111827; font-size:22px; font-weight:600;">
      Reset your password
    </h2>
    <p style="margin:0 0 16px; color:#374151; font-size:15px; line-height:1.6;">
      Hi ${name}, we received a request to reset the password for your JobBoard account.
      Click the button below to choose a new password.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background-color:#2563eb; border-radius:6px;">
          <a href="${resetUrl}" target="_blank"
             style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px; color:#6b7280; font-size:13px; line-height:1.6;">
      This link expires in ${expiresInMinutes} minutes and can only be used once.
    </p>
    <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
  `);

  return {
    subject: 'Reset your JobBoard password',
    html,
  };
};

export default passwordResetEmail;
