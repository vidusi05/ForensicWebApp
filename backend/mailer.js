import nodemailer from 'nodemailer';

function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

function createTransporter() {
  if (!mailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export function isEmailConfigured() {
  return mailConfigured();
}

export async function sendTempPasswordEmail({ to, name, tempPassword, requestedBy }) {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Email service is not configured');
  }

  const displayName = process.env.MAIL_FROM_NAME || 'Forensic Medicine Department';
  const subject = 'Temporary password for ForensicWebApp';
  const greeting = name ? `Dear ${name},` : 'Dear user,';
  const requesterLine = requestedBy ? `\nThis reset was processed by: ${requestedBy}\n` : '';

  await transporter.sendMail({
    from: `"${displayName}" <${process.env.MAIL_FROM}>`,
    to,
    subject,
    text: `${greeting}

Your temporary password is:

${tempPassword}

Please sign in with this temporary password and change it immediately.
${requesterLine}
If you did not request this password reset, please contact the System Administrator immediately.

ForensicWebApp`,
  });
}
