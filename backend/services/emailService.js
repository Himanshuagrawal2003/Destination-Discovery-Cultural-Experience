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
const sendEmail = async ({ to, subject, html }) => {
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
    }, 2500); // 2.5 seconds strict limit
  });

  try {
    const mailPromise = transporter.sendMail({
      from:    process.env.EMAIL_FROM || `"CultureQuest AI" <noreply@culturequest.ai>`,
      to,
      subject,
      html,
    });

    const result = await Promise.race([mailPromise, timeoutPromise]);
    if (result && result.timedOut) {
      console.warn('⚠️ SMTP email sending timed out after 2.5 seconds.');
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
        .header p  { color: rgba(255,255,255,.85); margin: 8px 0 0; }
        .body   { padding: 40px; }
        .body p { color: #475569; line-height: 1.6; }
        .btn    { display: inline-block; background: linear-gradient(135deg, #0f766e, #14b8a6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 20px 0; }
        .footer { padding: 24px 40px; background: #f8fafc; color: #94a3b8; font-size: 13px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌍 CultureQuest AI</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password. This link is valid for <strong>10 minutes</strong>.</p>
          <a href="${resetUrl}" class="btn">Reset Password →</a>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p style="word-break:break-all;font-size:13px;color:#94a3b8;">Or copy this link: ${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CultureQuest AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to, subject: '🔐 Reset Your CultureQuest AI Password', html });
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
