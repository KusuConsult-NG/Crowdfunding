import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface DonationEmailData {
    donorName: string;
    donorEmail: string;
    amount: number;
    currency: string;
    campaignTitle: string;
    campaignId: string;
    receiptCode: string;
    paymentMethod: 'ONLINE' | 'CASH';
    donationDate: Date;
    isRegisteredUser: boolean;
}

export async function sendDonationConfirmationEmail(data: DonationEmailData) {
    try {
        const subject = `Thank You for Your Donation - ${data.campaignTitle}`;
        const html = generateDonationEmailHTML(data);

        const result = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'ChurchFlow <noreply@churchflow.com>',
            to: data.donorEmail,
            subject,
            html,
        });

        return { success: true, messageId: result.data?.id };
    } catch (error) {
        console.error('Failed to send donation confirmation email:', error);
        return { success: false, error };
    }
}

function generateDonationEmailHTML(data: DonationEmailData): string {
    const formattedAmount = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: data.currency,
        minimumFractionDigits: 0,
    }).format(data.amount);

    const formattedDate = new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(data.donationDate);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const campaignUrl = `${appUrl}/campaigns/${data.campaignId}`;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You! 🙏</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">
            Dear <strong>${data.donorName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.8;">
            Thank you for your generous donation of <strong style="color: #6366f1; font-size: 20px;">${formattedAmount}</strong> 
            to <strong>${data.campaignTitle}</strong>!
          </p>
          
          <p style="font-size: 16px; line-height: 1.8;">
            Your support makes a real difference in advancing God's kingdom through ECWA churches.
          </p>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #6366f1;">Donation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Amount:</td>
                <td style="padding: 8px 0;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Campaign:</td>
                <td style="padding: 8px 0;">${data.campaignTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Payment Method:</td>
                <td style="padding: 8px 0;">${data.paymentMethod === 'CASH' ? 'Cash' : 'Online Payment'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Reference:</td>
                <td style="padding: 8px 0; font-family: monospace;">${data.receiptCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${campaignUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Campaign Progress
            </a>
          </div>

          ${data.isRegisteredUser ? `
            <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Log in to your ChurchFlow account to view your complete donation history 
                and track the progress of all campaigns you've supported.
              </p>
            </div>
          ` : `
            <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">
                <strong>Want to do more?</strong>
              </p>
              <p style="margin: 0; font-size: 14px;">
                Create a free account to track your donations, view complete campaign progress, 
                and stay updated on the impact of your giving.
              </p>
              <div style="margin-top: 15px;">
                <a href="${appUrl}/signup" 
                   style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px;">
                  Create Free Account
                </a>
              </div>
            </div>
          `}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              God bless you for your generosity!
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              <strong>The ChurchFlow Team</strong>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
          <p>If you have any questions, please contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@churchflow.com'}" style="color: #6366f1;">support@churchflow.com</a></p>
        </div>
      </body>
    </html>
  `;
}
