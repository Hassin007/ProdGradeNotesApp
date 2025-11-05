import nodemailer from "nodemailer"

export const sendResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Notiq',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #3B82F6; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Notiq</h1>
                <p style="color: #6B7280; font-size: 16px; margin: 0;">Smart Notes, Organized Thoughts</p>
            </div>

            <!-- Card -->
            <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Reset Your Password</h2>
                
                <p style="color: #6B7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                    You requested to reset your password for your Notiq account. Click the button below to create a new password.
                </p>

                <!-- Reset Button -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" 
                      style="background-color: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        Reset Password
                    </a>
                </div>

                <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
                    This link will expire in 1 hour for security reasons. If you didn't request this reset, please ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
                <p style="color: #9CA3AF; font-size: 14px; margin: 8px 0;">
                    This is an automated message from Notiq
                </p>
                <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0;">
                    If you have any questions, contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send reset email');
  }
};