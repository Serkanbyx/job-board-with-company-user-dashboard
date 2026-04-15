/**
 * Wraps email content in a professional, responsive HTML email layout.
 * Uses inline CSS only — external stylesheets are not supported by most email clients.
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JobBoard</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb; padding:24px 32px; border-radius:8px 8px 0 0; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">
                JobBoard
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color:#ffffff; padding:32px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:24px 32px; border-radius:0 0 8px 8px; border:1px solid #e5e7eb; border-top:none; text-align:center;">
              <p style="margin:0 0 8px; color:#6b7280; font-size:13px; line-height:1.5;">
                This email was sent by JobBoard. If you didn't expect this email, you can safely ignore it.
              </p>
              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.5;">
                To manage your email preferences, visit your account settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default baseTemplate;
