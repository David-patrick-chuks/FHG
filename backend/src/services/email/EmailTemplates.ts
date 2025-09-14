/**
 * Email template generation service
 * Handles HTML and text template generation for various email types
 */

export class EmailTemplates {
  /**
   * Generate HTML for password reset link email
   */
  public static generatePasswordResetLinkHTML(username: string, resetLink: string): string {
    const currentYear = new Date().getFullYear();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - MailQuill Team</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome-section h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        .welcome-section p {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .cta-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .warning-section {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .warning-section h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .warning-section p {
            color: #92400e;
            margin: 0 0 8px 0;
        }
        .info-section {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-section h3 {
            color: #0c4a6e;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .info-section p {
            color: #0c4a6e;
            margin: 0 0 8px 0;
        }
        .link-fallback {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #6b7280;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>MailQuill Team - Secure Account Recovery</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>Hello ${username}! 👋</h2>
                <p>We received a request to reset your password for your MailQuill account.</p>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <h3 style="color: #1f2937; margin: 0 0 16px 0;">Ready to reset your password?</h3>
                <p style="color: #6b7280; margin: 0 0 20px 0;">Click the button below to create a new secure password for your account.</p>
                <a href="${resetLink}" class="cta-button">
                    Reset My Password 🔑
                </a>
            </div>

            <!-- Security Warning -->
            <div class="warning-section">
                <h3>⚠️ Important Security Information</h3>
                <p><strong>This link will expire in 1 hour</strong> for your security.</p>
                <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            </div>

            <!-- Additional Information -->
            <div class="info-section">
                <h3>💡 Need Help?</h3>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="link-fallback">${resetLink}</div>
                <p>For any questions or concerns, please contact our support team.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>MailQuill Support Team</strong></p>
            <p>We're here to help you succeed with your AI email marketing journey.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © ${currentYear} MailQuill. All rights reserved.<br>
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text for password reset link email
   */
  public static generatePasswordResetLinkText(username: string, resetLink: string): string {
    return `
🔐 Password Reset - MailQuill
MailQuill - Secure Account Recovery

Hello ${username}! 👋

We received a request to reset your password for your MailQuill account.

READY TO RESET YOUR PASSWORD?
Click the link below to create a new secure password for your account:
${resetLink}

⚠️ IMPORTANT SECURITY INFORMATION:
• This link will expire in 1 hour for your security
• If you didn't request this password reset, please ignore this email or contact our support team immediately

💡 NEED HELP?
For any questions or concerns, please contact our support team.

Best regards,
MailQuill Support Team
We're here to help you succeed with your AI email marketing journey.

---
© ${new Date().getFullYear()} MailQuill. All rights reserved.
This is an automated email. Please do not reply to this message.
    `;
  }

  /**
   * Generate HTML for campaign completion email
   */
  public static generateCampaignCompletionHTML(
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): string {
    const successRate = totalEmails > 0 ? Math.round((successCount / totalEmails) * 100) : 0;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Campaign Completed: ${campaignName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Completed!</h1>
          </div>
          <div class="content">
            <p>Your campaign <strong>${campaignName}</strong> has been completed successfully!</p>
            <div class="stats">
              <div class="stat-item">
                <span>Total Emails:</span>
                <strong>${totalEmails}</strong>
              </div>
              <div class="stat-item">
                <span>Successfully Sent:</span>
                <strong>${successCount}</strong>
              </div>
              <div class="stat-item">
                <span>Success Rate:</span>
                <strong>${successRate}%</strong>
              </div>
            </div>
            <p>View detailed analytics and performance metrics in your dashboard.</p>
            <p>Best regards,<br>The Email Outreach Bot Team</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Email Outreach Bot.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for campaign completion email
   */
  public static generateCampaignCompletionText(
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): string {
    const successRate = totalEmails > 0 ? Math.round((successCount / totalEmails) * 100) : 0;
    
    return `
Campaign Completed: ${campaignName}

Your campaign "${campaignName}" has been completed successfully!

Campaign Summary:
- Total Emails: ${totalEmails}
- Successfully Sent: ${successCount}
- Success Rate: ${successRate}%

View detailed analytics and performance metrics in your dashboard.

Best regards,
The Email Outreach Bot Team

---
This is an automated notification from Email Outreach Bot.
    `;
  }

  /**
   * Generate HTML for subscription expiry reminder
   */
  public static generateSubscriptionExpiryHTML(username: string, daysUntilExpiry: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Expires Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .cta { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Expires Soon</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <div class="warning">
              <p><strong>Important:</strong> Your Email Outreach Bot subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.</p>
            </div>
            <p>To avoid any interruption to your email outreach campaigns, please renew your subscription before it expires.</p>
            <p>Current subscription benefits:</p>
            <ul>
              <li>AI-powered email generation</li>
              <li>Campaign management tools</li>
              <li>Performance analytics</li>
              <li>Priority support</li>
            </ul>
            <div class="cta">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions" class="btn">Renew Subscription</a>
            </div>
            <p>If you have any questions about your subscription, please contact our support team.</p>
            <p>Best regards,<br>The Email Outreach Bot Team</p>
          </div>
          <div class="footer">
            <p>Thank you for using Email Outreach Bot!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for subscription expiry reminder
   */
  public static generateSubscriptionExpiryText(username: string, daysUntilExpiry: number): string {
    return `
Subscription Expires Soon

Hello ${username},

IMPORTANT: Your Email Outreach Bot subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.

To avoid any interruption to your email outreach campaigns, please renew your subscription before it expires.

Current subscription benefits:
- AI-powered email generation
- Campaign management tools
- Performance analytics
- Priority support

Renew your subscription: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions

If you have any questions about your subscription, please contact our support team.

Best regards,
The Email Outreach Bot Team

---
Thank you for using Email Outreach Bot!
    `;
  }
}
