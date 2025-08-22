// Minimal email utility for development/testing
// In production, replace this with a real email provider integration (e.g., SendGrid, SES, Nodemailer SMTP)

async function sendEmail({ to, subject, text, html }) {
  const payload = { to, subject, text, html };
  try {
    // For dev: log the email payload. Do NOT log in production.
    // eslint-disable-next-line no-console
    console.log('[DEV] sendEmail called with:', JSON.stringify(payload, null, 2));
    return { success: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('sendEmail error:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };

