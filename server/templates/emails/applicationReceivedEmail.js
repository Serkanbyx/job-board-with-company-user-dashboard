import env from '../../config/env.js';
import baseTemplate from './baseTemplate.js';

/**
 * Generates an email notifying a company about a new application.
 * Sent to the company's email address.
 */
const applicationReceivedEmail = (company, candidate, job) => {
  const companyName = company.firstName || 'Hiring Manager';
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;
  const jobTitle = job.title;
  const jobId = job._id;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px; color:#111827; font-size:22px; font-weight:600;">
      New Application: ${jobTitle}
    </h2>
    <p style="margin:0 0 8px; color:#374151; font-size:15px; line-height:1.6;">
      Hi ${companyName},
    </p>
    <p style="margin:0 0 24px; color:#374151; font-size:15px; line-height:1.6;">
      <strong>${candidateName}</strong> has applied to your position
      '<strong>${jobTitle}</strong>'. Review their application in your dashboard.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background-color:#2563eb; border-radius:6px;">
          <a href="${env.CLIENT_URL}/company/jobs/${jobId}/applications" target="_blank"
             style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none;">
            View Application
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `New Application: ${jobTitle}`,
    html,
  };
};

export default applicationReceivedEmail;
