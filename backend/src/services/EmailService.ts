/**
 * Main Email Service
 * 
 * This is the main EmailService class that combines all email-related functionality.
 * It provides a unified interface for all email operations while delegating to specialized services.
 */

import { ApiResponse } from '../types';
import { EmailSender } from './email/EmailSender';
import { EmailTemplates } from './email/EmailTemplates';
import { EmailVerification } from './email/EmailVerification';
import { SystemEmailService } from './email/SystemEmailService';

export class EmailService {
  // System Email Methods
  public static async sendSimpleEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    return SystemEmailService.sendSimpleEmail(to, subject, html, text);
  }

  public static async sendPasswordResetLink(
    email: string, 
    username: string, 
    resetLink: string
  ): Promise<void> {
    return SystemEmailService.sendPasswordResetLink(email, username, resetLink);
  }

  public static async sendCampaignCompletionEmail(
    email: string, 
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): Promise<void> {
    return SystemEmailService.sendCampaignCompletionEmail(email, campaignName, totalEmails, successCount);
  }

  public static async sendSubscriptionExpiryReminder(
    email: string, 
    username: string, 
    daysUntilExpiry: number
  ): Promise<void> {
    return SystemEmailService.sendSubscriptionExpiryReminder(email, username, daysUntilExpiry);
  }

  // Email Sending Methods
  public static async sendEmail(
    botId: string,
    recipientEmail: string,
    subject: string,
    message: string,
    campaignId: string,
    generatedMessageId?: string
  ): Promise<ApiResponse<{ messageId: string; sentAt: Date }>> {
    return EmailSender.sendEmail(botId, recipientEmail, subject, message, campaignId, generatedMessageId);
  }

  public static async sendBulkEmails(
    botId: string,
    emails: Array<{ email: string; message: string }>,
    campaignId: string,
    subject: string,
    delayMs: number = 60000
  ): Promise<ApiResponse<{ sent: number; failed: number; total: number }>> {
    return EmailSender.sendBulkEmails(botId, emails, campaignId, subject, delayMs);
  }

  // Email Verification Methods
  public static async verifyBotCredentials(email: string, password: string): Promise<ApiResponse<{ verified: boolean; message: string }>> {
    return EmailVerification.verifyBotCredentials(email, password);
  }

  public static async testBotConnection(botId: string): Promise<ApiResponse<{ connected: boolean; message: string }>> {
    return EmailVerification.testBotConnection(botId);
  }

  public static async getEmailStats(botId: string, days: number = 30): Promise<ApiResponse<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalReplied: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    replyRate: number;
  }>> {
    return EmailVerification.getEmailStats(botId, days);
  }

  // Template Generation Methods (for external use)
  public static generatePasswordResetLinkHTML(username: string, resetLink: string): string {
    return EmailTemplates.generatePasswordResetLinkHTML(username, resetLink);
  }

  public static generatePasswordResetLinkText(username: string, resetLink: string): string {
    return EmailTemplates.generatePasswordResetLinkText(username, resetLink);
  }

  public static generateCampaignCompletionHTML(campaignName: string, totalEmails: number, successCount: number): string {
    return EmailTemplates.generateCampaignCompletionHTML(campaignName, totalEmails, successCount);
  }

  public static generateCampaignCompletionText(campaignName: string, totalEmails: number, successCount: number): string {
    return EmailTemplates.generateCampaignCompletionText(campaignName, totalEmails, successCount);
  }

  public static generateSubscriptionExpiryHTML(username: string, daysUntilExpiry: number): string {
    return EmailTemplates.generateSubscriptionExpiryHTML(username, daysUntilExpiry);
  }

  public static generateSubscriptionExpiryText(username: string, daysUntilExpiry: number): string {
    return EmailTemplates.generateSubscriptionExpiryText(username, daysUntilExpiry);
  }
}