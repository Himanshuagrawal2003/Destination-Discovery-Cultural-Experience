const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter configured via environment variables.
 * Supports Gmail with App Password or any SMTP provider.
 */
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const isEmailConfigured = 
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (!isEmailConfigured) {
    console.log('ℹ️ SMTP Email service not configured. Skipping email send.');
    return { skipped: true };
  }

  // Create a timeout promise to prevent freezing/timing out deployed serverless functions
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timedOut: true });
    }, 10000); // 10 seconds
  });

  // Always use the authenticated Gmail address as "from" to avoid spam
  const fromAddress = `"CultureQuest AI" <${process.env.EMAIL_USER}>`;

  try {
    const mailPromise = transporter.sendMail({
      from:        fromAddress,
      to,
      subject,
      text:        text || 'Please view this email in an HTML-capable mail client.',
      html,
      headers: {
        'X-Priority':       '1',
        'X-Mailer':         'CultureQuest AI Mailer',
        'Reply-To':         process.env.EMAIL_USER,
        'X-Entity-Ref-ID':  Date.now().toString(),
      },
    });

    const result = await Promise.race([mailPromise, timeoutPromise]);
    if (result && result.timedOut) {
      console.warn('⚠️ SMTP email sending timed out.');
    }
    return result;
  } catch (err) {
    console.error('⚠️ SMTP email sending error:', err.message);
    return { error: err.message };
  }
};

/**
 * Send password reset email with a link
 */
const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const plainText = `
Hi ${name},

We received a request to reset your CultureQuest AI password.

Click the link below to reset your password (valid for 10 minutes):
${resetUrl}

If you did not request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} CultureQuest AI
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - CultureQuest AI</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #334155; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0f766e; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .body p { color: #475569; line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
        .btn-wrap { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }
        .url-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #64748b; word-break: break-all; margin-top: 8px; }
        .warning { font-size: 13px; color: #94a3b8; margin-top: 20px; }
        .footer { padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CultureQuest AI</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We received a request to reset the password for your CultureQuest AI account. Click the button below to set a new password. This link is valid for <strong>10 minutes</strong>.</p>
          <div class="btn-wrap">
            <a href="${resetUrl}" class="btn">Reset My Password</a>
          </div>
          <p style="font-size:13px;color:#64748b;">Or copy and paste this link into your browser:</p>
          <div class="url-box">${resetUrl}</div>
          <p class="warning">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CultureQuest AI &nbsp;|&nbsp; This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your CultureQuest AI Password',
    html,
    text: plainText,
  });
};


/**
 * Send welcome email after registration
 */
const sendWelcomeEmail = async (to, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Inter, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .header { background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 40px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 28px; }
        .body   { padding: 40px; }
        .body p { color: #475569; line-height: 1.6; }
        .feature { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
        .footer { padding: 24px 40px; background: #f8fafc; color: #94a3b8; font-size: 13px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌍 Welcome to CultureQuest AI!</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>, welcome aboard! 🎉</p>
          <p>You're now part of a community of travelers discovering the world through AI-powered cultural experiences.</p>
          <p>Here's what you can do:</p>
          <div class="feature">🤖 <span>Get AI-powered destination recommendations</span></div>
          <div class="feature">🗺️ <span>Plan day-wise itineraries with Gemini AI</span></div>
          <div class="feature">💰 <span>Generate smart travel budgets</span></div>
          <div class="feature">🏛️ <span>Explore hidden gems and cultural experiences</span></div>
          <p>Start your journey at <a href="${process.env.CLIENT_URL}" style="color:#0f766e;">CultureQuest AI</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CultureQuest AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to, subject: '🌍 Welcome to CultureQuest AI!', html });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };
