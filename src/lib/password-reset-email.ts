import { Resend } from 'resend';

// Initialize Resend safely - checks for key to prevent build errors
const resendApiKey = process.env.RESEND_API_KEY || 're_123456789'; // Fallback for build time
const resend = new Resend(resendApiKey);

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password/${token}`;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'ChurchFlow <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your ChurchFlow Password',
      html: generatePasswordResetHTML(resetUrl),
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

function generatePasswordResetHTML(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.8;">
            Hello,
          </p>
          
          <p style="font-size: 16px; line-height: 1.8;">
            We received a request to reset your password for your ChurchFlow account. Click the button below to create a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #6366f1; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>

          <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⏰ This link expires in 1 hour</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
              For your security, this password reset link can only be used once and expires after 1 hour.
            </p>
          </div>

          <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #991b1b;">
              <strong>⚠️ Didn't request this?</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">
              If you didn't request a password reset, please ignore this email. Your password will not be changed.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              For security reasons, we recommend:
            </p>
            <ul style="font-size: 14px; color: #6b7280; margin: 10px 0; padding-left: 20px;">
              <li>Using a strong, unique password</li>
              <li>Never sharing your password with anyone</li>
              <li>Enabling two-factor authentication (if available)</li>
            </ul>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              <strong>The ChurchFlow Team</strong>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>If you need assistance, contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@churchflow.com'}" style="color: #6366f1;">support@churchflow.com</a></p>
        </div>
      </body>
    </html>
  `;
}
