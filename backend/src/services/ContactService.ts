import nodemailer from 'nodemailer';
import { Logger } from '../utils/Logger';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}

export class ContactService {
  private static logger: Logger = new Logger();
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize the email transporter for contact form emails
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_AUTH_USER || '',
          pass: process.env.SMTP_AUTH_PASS || ''
        }
      });

      // Verify connection configuration
      try {
        await this.transporter.verify();
        ContactService.logger.info('Contact email transporter configured successfully');
      } catch (error) {
        ContactService.logger.error('Contact email transporter configuration failed:', error);
        throw new Error('Contact email service configuration failed');
      }
    }

    return this.transporter;
  }

  /**
   * Send contact form email to support team
   */
  public static async sendContactFormEmail(contactData: ContactFormData): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_AUTH_USER || 'support@mailquill.com';
      
      // Create HTML email template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #667eea; }
            .message { white-space: pre-wrap; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 New Contact Form Submission</h2>
              <p>Someone has submitted a contact form on MailQuill</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${contactData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${contactData.email}</div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${contactData.subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value message">${contactData.message}</div>
              </div>
              <div class="field">
                <div class="label">IP Address:</div>
                <div class="value">${contactData.ip}</div>
              </div>
              <div class="field">
                <div class="label">Submitted At:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the MailQuill contact form.</p>
              <p>Please respond directly to the sender's email: ${contactData.email}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create plain text version
      const textContent = `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}
Message: ${contactData.message}
IP Address: ${contactData.ip}
Submitted At: ${new Date().toLocaleString()}

Please respond directly to the sender's email: ${contactData.email}
      `;

      // Send email to support team
      await transporter.sendMail({
        from: `"MailQuill Contact Form" <${process.env.SMTP_AUTH_USER}>`,
        to: supportEmail,
        replyTo: contactData.email, // Allow direct reply to the sender
        subject: `[Contact Form] ${contactData.subject}`,
        text: textContent,
        html: htmlContent
      });

      // Send auto-reply to the sender
      await this.sendAutoReply(contactData);

      ContactService.logger.info('Contact form email sent successfully', {
        from: contactData.email,
        subject: contactData.subject
      });

    } catch (error) {
      ContactService.logger.error('Failed to send contact form email:', error);
      throw new Error('Failed to send contact form email');
    }
  }

  /**
   * Send auto-reply to the person who submitted the contact form
   */
  private static async sendAutoReply(contactData: ContactFormData): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Contacting MailQuill</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .cta { text-align: center; margin: 20px 0; }
            .cta a { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You for Contacting MailQuill! 🚀</h2>
            </div>
            <div class="content">
              <p>Hi ${contactData.name},</p>
              
              <p>Thank you for reaching out to us! We've received your message about "<strong>${contactData.subject}</strong>" and our team will get back to you within 24 hours.</p>
              
              <p>In the meantime, here are some quick ways to get help:</p>
              <ul>
                <li>📞 <strong>Call us directly:</strong> +234 701 418 5686</li>
                <li>💬 <strong>Join our WhatsApp community:</strong> <a href="https://wa.me/2347014185686">Click here to join</a></li>
                <li>📧 <strong>Email us anytime:</strong> support@mailquill.com</li>
              </ul>
              
              <div class="cta">
                <a href="https://www.agentworld.online/features">Explore Our Features</a>
              </div>
              
              <p>Best regards,<br>The MailQuill Team</p>
            </div>
            <div class="footer">
              <p>This is an automated response. Please do not reply to this email.</p>
              <p>If you need immediate assistance, please call us or join our WhatsApp community.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Thank You for Contacting MailQuill!

Hi ${contactData.name},

Thank you for reaching out to us! We've received your message about "${contactData.subject}" and our team will get back to you within 24 hours.

In the meantime, here are some quick ways to get help:
- Call us directly: +234 701 418 5686
- Join our WhatsApp community: https://wa.me/2347014185686
- Email us anytime: support@mailquill.com

Best regards,
The MailQuill Team

This is an automated response. Please do not reply to this email.
If you need immediate assistance, please call us or join our WhatsApp community.
      `;

      await transporter.sendMail({
        from: `"MailQuill Support" <${process.env.SMTP_AUTH_USER}>`,
        to: contactData.email,
        subject: 'Thank you for contacting MailQuill - We\'ll be in touch soon!',
        text: textContent,
        html: htmlContent
      });

      ContactService.logger.info('Auto-reply sent successfully', {
        to: contactData.email
      });

    } catch (error) {
      ContactService.logger.error('Failed to send auto-reply:', error);
      // Don't throw error for auto-reply failure, just log it
    }
  }
}
