import env from '../../config/env.js';
import baseTemplate from './baseTemplate.js';

/**
 * Generates a welcome email for new users.
 * Content and CTA vary by role (candidate vs company).
 */
const welcomeEmail = (user) => {
  const isCompany = user.role === 'company';
  const name = user.firstName || 'there';

  const heading = `Welcome to JobBoard, ${name}!`;

  const message = isCompany
    ? 'Your company profile is ready. Start posting jobs and finding talent.'
    : 'Your account is ready. Start browsing jobs and applying today.';

  const ctaText = isCompany ? 'Post a Job' : 'Browse Jobs';
  const ctaUrl = isCompany
    ? `${env.CLIENT_URL}/company/jobs/create`
    : `${env.CLIENT_URL}/jobs`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px; color:#111827; font-size:22px; font-weight:600;">
      ${heading}
    </h2>
    <p style="margin:0 0 24px; color:#374151; font-size:15px; line-height:1.6;">
      ${message}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background-color:#2563eb; border-radius:6px;">
          <a href="${ctaUrl}" target="_blank"
             style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: 'Welcome to JobBoard!',
    html,
  };
};

export default welcomeEmail;
