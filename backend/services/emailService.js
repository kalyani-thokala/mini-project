import nodemailer from "nodemailer";

export const sendResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  // Configure transporter using env variables, or create a mock transporter if not configured
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";

  const emailBody = `Hello,

You requested a password reset.

Click the link below:

${resetUrl}

This link expires in 15 minutes.

If you did not request this reset, ignore this email.`;

  // Always log the link to the console for mock testing/seeding purposes
  console.log(`\n====================================================`);
  console.log(`[EMAIL SERVICE] Password Reset Link for ${email}:`);
  console.log(resetUrl);
  console.log(`====================================================\n`);

  if (!smtpUser || !smtpPass) {
    console.log("[EMAIL SERVICE] SMTP credentials not fully configured in env, logged to console instead.");
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"PrepMaster AI" <${smtpUser}>`,
      to: email,
      subject: "PrepMaster AI Password Reset",
      text: emailBody
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL SERVICE] Failed to send email via SMTP:", error.message);
    // Graceful fallback: return success with log message so the application flow doesn't crash
    return { success: true, error: error.message };
  }
};
