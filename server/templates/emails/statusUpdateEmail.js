import env from '../../config/env.js';
import baseTemplate from './baseTemplate.js';

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const STATUS_COLORS = {
  reviewed: '#f59e0b',
  shortlisted: '#22c55e',
  interviewed: '#f59e0b',
  offered: '#22c55e',
  hired: '#22c55e',
  rejected: '#ef4444',
};

/**
 * Generates an email notifying a candidate about an application status update.
 * Status is displayed with a contextual color badge.
 */
const statusUpdateEmail = (candidate, job, newStatus, note) => {
  const candidateName = escapeHtml(candidate.firstName) || 'there';
  const jobTitle = escapeHtml(job.title);
  const companyName = escapeHtml(job.company?.companyName) || 'the employer';
  const statusColor = STATUS_COLORS[newStatus] || '#6b7280';
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  const noteSection = note
    ? `
      <div style="margin:16px 0 24px; padding:16px; background-color:#f9fafb; border-left:4px solid ${statusColor}; border-radius:4px;">
        <p style="margin:0 0 4px; color:#6b7280; font-size:13px; font-weight:600;">Note from the employer:</p>
        <p style="margin:0; color:#374151; font-size:14px; line-height:1.5;">${escapeHtml(note)}</p>
      </div>
    `
    : '';

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px; color:#111827; font-size:22px; font-weight:600;">
      Application Update: ${jobTitle}
    </h2>
    <p style="margin:0 0 8px; color:#374151; font-size:15px; line-height:1.6;">
      Hi ${candidateName},
    </p>
    <p style="margin:0 0 16px; color:#374151; font-size:15px; line-height:1.6;">
      Your application for '<strong>${jobTitle}</strong>' at <strong>${companyName}</strong> has been updated to:
    </p>
    <p style="margin:0 0 16px; text-align:center;">
      <span style="display:inline-block; padding:8px 20px; background-color:${statusColor}; color:#ffffff; font-size:14px; font-weight:700; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">
        ${statusLabel}
      </span>
    </p>
    ${noteSection}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background-color:#2563eb; border-radius:6px;">
          <a href="${env.CLIENT_URL}/candidate/applications" target="_blank"
             style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none;">
            View Applications
          </a>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `Application Update: ${jobTitle}`,
    html,
  };
};

export default statusUpdateEmail;
