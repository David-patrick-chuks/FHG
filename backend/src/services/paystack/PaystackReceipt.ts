import htmlPdf from 'html-pdf-node';
import PaymentModel from '../../models/Payment';
import UserModel from '../../models/User';
import { ApiResponse } from '../../types';
import { PaystackCore } from './PaystackCore';
import path from "path"
import fs from "fs"

export class PaystackReceipt extends PaystackCore {
  public static async generateReceipt(
    userId: string,
    reference: string
  ): Promise<ApiResponse<Buffer>> {
    try {
      const payment = await PaymentModel.findOne({ reference, userId });
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          timestamp: new Date()
        };
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Generate PDF receipt using HTML
      const pdfBuffer = await PaystackReceipt.generateReceiptPDF(payment, user);

      return {
        success: true,
        message: 'Receipt generated successfully',
        data: pdfBuffer,
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackReceipt.logger.error('Error generating receipt:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId,
        reference
      });

      return {
        success: false,
        message: 'Failed to generate receipt',
        timestamp: new Date()
      };
    }
  }

  private static async generateReceiptPDF(payment: any, user: any): Promise<Buffer> {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate expiry date (1 year from payment date)
    const paymentDate = payment.paidAt || payment.createdAt;
    const expiryDate = new Date(paymentDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Safe data extraction with fallbacks
    const safePayment = {
      reference: payment.reference || 'N/A',
      amount: payment.amount || 0,
      status: payment.status || 'unknown',
      subscriptionTier: payment.subscriptionTier || 'basic',
      billingCycle: payment.billingCycle || 'monthly',
      paidAt: payment.paidAt || payment.createdAt
    };

    const safeUser = {
      username: user.username || 'User',
      email: user.email || 'user@example.com'
    };

    // Read and process the MailQuill logo
    const logoPath = path.join(process.cwd(), 'public', 'MailQuill.svg');
    let logoData = '';
    try {
      const logoContent = fs.readFileSync(logoPath, 'utf8');
      // Clean and prepare the logo for embedding
      logoData = logoContent
        .replace(/fill="#000000"/g, 'fill="#1e3a8a"') // Change color to brand blue
        .replace(/width="275\.000000pt"/g, 'width="40"')
        .replace(/height="282\.000000pt"/g, 'height="40"')
        .replace(/viewBox="0 0 275\.000000 282\.000000"/g, 'viewBox="0 0 275 282"')
        .replace(/<?xml[^>]*>/g, '') // Remove XML declaration
        .replace(/<!DOCTYPE[^>]*>/g, '') // Remove DOCTYPE
        .replace(/<metadata>[\s\S]*?<\/metadata>/g, '') // Remove metadata
        .trim();
    } catch (error) {
      PaystackReceipt.logger.warn('Could not load MailQuill logo, using fallback', { error: error instanceof Error ? error.message : 'Unknown error' });
      logoData = '';
    }

    // Create HTML receipt
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MailQuill Payment Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background: #ffffff;
            color: #111827;
            line-height: 1.6;
          }
          
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 8px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
          }
          
          .logo svg {
            width: 40px;
            height: 40px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .company-tagline {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 16px;
          }
          
          .receipt-title {
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .receipt-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px;
          }
          
          .payment-summary {
            background: linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
          }
          
          .summary-title {
            color: #1e3a8a;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          
          .amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .amount-label {
            color: #374151;
            font-size: 14px;
          }
          
          .amount-value {
            color: #059669;
            font-size: 24px;
            font-weight: bold;
          }
          
          .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .status-label {
            color: #374151;
            font-size: 14px;
          }
          
          .status-badge {
            background: #059669;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .section-title {
            color: #1e3a8a;
            font-size: 16px;
            font-weight: bold;
            margin: 30px 0 20px 0;
          }
          
          .details-table {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-row:nth-child(even) {
            background: #f9fafb;
          }
          
          .detail-label {
            color: #6b7280;
            font-size: 13px;
          }
          
          .detail-value {
            color: #111827;
            font-size: 13px;
            font-weight: 500;
            text-align: right;
          }
          
          .footer {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin-top: 30px;
          }
          
          .footer-title {
            color: #1e3a8a;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .footer-text {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 8px;
          }
          
          .footer-date {
            color: #9ca3af;
            font-size: 10px;
            margin-top: 15px;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            font-size: 48px;
            font-weight: bold;
            color: #1e3a8a;
            pointer-events: none;
            z-index: -1;
          }
          
          @media print {
            body {
              margin: 0;
            }
            .receipt-container {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="receipt-number">Receipt # ${safePayment.reference}</div>
            <div class="logo">
              ${logoData ? logoData : 'MQ'}
            </div>
            <div class="company-name">MailQuill</div>
            <div class="company-tagline">Email Marketing Platform</div>
            <div class="receipt-title">Payment Receipt</div>
          </div>
          
          <div class="content">
            <div class="payment-summary">
              <div class="summary-title">Payment Summary</div>
              <div class="amount-row">
                <span class="amount-label">Amount Paid</span>
                <span class="amount-value">${formatCurrency(safePayment.amount)}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Status</span>
                <span class="status-badge">${safePayment.status.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="section-title">Payment Details</div>
            <div class="details-table">
              <div class="detail-row">
                <span class="detail-label">Transaction Reference</span>
                <span class="detail-value">${safePayment.reference}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Subscription Plan</span>
                <span class="detail-value">${safePayment.subscriptionTier.charAt(0).toUpperCase() + safePayment.subscriptionTier.slice(1)} - ${safePayment.billingCycle.charAt(0).toUpperCase() + safePayment.billingCycle.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date</span>
                <span class="detail-value">${formatDate(safePayment.paidAt)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method</span>
                <span class="detail-value">Paystack</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Expires On</span>
                <span class="detail-value">${formatDate(expiryDate)}</span>
              </div>
            </div>
            
            <div class="section-title">Customer Information</div>
            <div class="details-table">
              <div class="detail-row">
                <span class="detail-label">Customer Name</span>
                <span class="detail-value">${safeUser.username.charAt(0).toUpperCase() + safeUser.username.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email Address</span>
                <span class="detail-value">${safeUser.email}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-title">Thank you for choosing MailQuill!</div>
              <div class="footer-text">This receipt serves as proof of payment for your MailQuill subscription.</div>
              <div class="footer-text">Please keep this receipt for your records.</div>
              <div class="footer-date">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          
          <div class="watermark">MailQuill</div>
        </div>
      </body>
      </html>
    `;

    // Configure PDF options
    const options = {
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true
    };

    try {
      // Generate PDF from HTML
      const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
      
      return pdfBuffer;
    } catch (error) {
      PaystackReceipt.logger.error('Error generating PDF:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback: create a simple HTML receipt
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt { border: 2px solid #1e3a8a; padding: 20px; border-radius: 8px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MailQuill Payment Receipt</h1>
          </div>
          <div class="receipt">
            <div class="row"><span class="label">Reference:</span> <span>${safePayment.reference}</span></div>
            <div class="row"><span class="label">Amount:</span> <span>${formatCurrency(safePayment.amount)}</span></div>
            <div class="row"><span class="label">Status:</span> <span>${safePayment.status}</span></div>
            <div class="row"><span class="label">Customer:</span> <span>${safeUser.username}</span></div>
            <div class="row"><span class="label">Email:</span> <span>${safeUser.email}</span></div>
            <div class="row"><span class="label">Date:</span> <span>${formatDate(safePayment.paidAt)}</span></div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280;">
              Thank you for choosing MailQuill!
            </div>
          </div>
        </body>
        </html>
      `;
      
      const fallbackPdf = await htmlPdf.generatePdf({ content: fallbackHtml }, options);
      return fallbackPdf;
    }
  }
}
