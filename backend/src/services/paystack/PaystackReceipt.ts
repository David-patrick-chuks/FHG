import puppeteer from 'puppeteer';
import PaymentModel from '../../models/Payment';
import UserModel from '../../models/User';
import { ApiResponse } from '../../types';
import { PaystackCore } from './PaystackCore';

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

      // Generate PNG receipt
      const imageBuffer = await PaystackReceipt.generateReceiptPNG(payment, user);

      return {
        success: true,
        message: 'Receipt generated successfully',
        data: imageBuffer,
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

  private static generateReceiptHTML(payment: any, user: any): string {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create HTML receipt with enhanced brand design
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt - MailQuill</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            width: 450px;
            height: 600px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .receipt {
            width: 400px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            position: relative;
          }
          .receipt::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3B82F6 0%, #06B6D4 50%, #3B82F6 100%);
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes shimmer {
            0%, 100% { background-position: 200% 0; }
            50% { background-position: -200% 0; }
          }
          .header {
            background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .header-content {
            position: relative;
            z-index: 1;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
          }
          .content {
            padding: 32px 24px;
          }
          .section {
            margin-bottom: 28px;
          }
          .section h3 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .section h3::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #3B82F6, #06B6D4);
            border-radius: 2px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 12px 0;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #e2e8f0;
            transition: all 0.2s ease;
          }
          .row:hover {
            background: #f1f5f9;
            border-left-color: #3B82F6;
            transform: translateX(2px);
          }
          .label {
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          }
          .value {
            color: #0f172a;
            font-weight: 600;
            font-size: 14px;
          }
          .amount {
            color: #059669;
            font-weight: 700;
            font-size: 16px;
          }
          .status {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
            margin: 32px 0;
            position: relative;
          }
          .divider::after {
            content: '✉️';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 0 12px;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            margin-top: 24px;
            padding: 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 8px 0;
            font-weight: 500;
          }
          .footer .main-message {
            color: #3B82F6;
            font-weight: 600;
            font-size: 16px;
          }
          .footer .small {
            font-size: 12px;
            color: #94a3b8;
            font-weight: 400;
          }
          .brand-accent {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
            border-radius: 50%;
            transform: translate(30px, 30px);
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="header-content">
              <h1>MailQuill</h1>
              <p>Payment Receipt</p>
            </div>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>Payment Details</h3>
              <div class="row">
                <span class="label">Reference</span>
                <span class="value">${payment.reference}</span>
              </div>
              <div class="row">
                <span class="label">Amount</span>
                <span class="value amount">${formatCurrency(payment.amount)}</span>
              </div>
              <div class="row">
                <span class="label">Plan</span>
                <span class="value">${payment.subscriptionTier} - ${payment.billingCycle}</span>
              </div>
              <div class="row">
                <span class="label">Date</span>
                <span class="value">${formatDate(payment.paidAt || payment.createdAt)}</span>
              </div>
              <div class="row">
                <span class="label">Status</span>
                <span class="status">${payment.status.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Customer Information</h3>
              <div class="row">
                <span class="label">Name</span>
                <span class="value">${user.username}</span>
              </div>
              <div class="row">
                <span class="label">Email</span>
                <span class="value">${user.email}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p class="main-message">Thank you for choosing MailQuill!</p>
              <p class="small">This is your official payment receipt</p>
              <p class="small">Keep this receipt for your records</p>
            </div>
          </div>
          
          <div class="brand-accent"></div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private static async generateReceiptPNG(payment: any, user: any): Promise<Buffer> {
    const html = PaystackReceipt.generateReceiptHTML(payment, user);

    // Use Puppeteer to convert HTML to PNG
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Set viewport to match receipt size
      await page.setViewport({ width: 450, height: 600, deviceScaleFactor: 2 });
      
      // Take screenshot as PNG
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 450,
          height: 600
        }
      });
      
      return screenshot as Buffer;
    } finally {
      await browser.close();
    }
  }
}
