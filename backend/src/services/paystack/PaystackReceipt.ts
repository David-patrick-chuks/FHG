import sharp from 'sharp';
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

      // Generate PNG receipt using Sharp
      const imageBuffer = await PaystackReceipt.generateReceiptImage(payment, user);

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

  private static async generateReceiptImage(payment: any, user: any): Promise<Buffer> {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Receipt dimensions - more professional A4-like proportions
    const width = 600;
    const height = 800;
    const padding = 40;

    // Create professional SVG receipt
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:0.05" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:0.05" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#ffffff"/>
        
        <!-- Receipt Card with subtle shadow -->
        <rect x="${padding}" y="${padding}" width="${width - 2 * padding}" height="${height - 2 * padding}" 
              rx="8" ry="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- Header -->
        <rect x="${padding}" y="${padding}" width="${width - 2 * padding}" height="120" 
              fill="url(#headerGradient)" rx="8" ry="8"/>
        
        <!-- Company Logo Area -->
        <rect x="${padding + 20}" y="${padding + 20}" width="60" height="60" fill="white" rx="8" ry="8"/>
        <text x="${padding + 50}" y="${padding + 45}" text-anchor="middle" fill="#1e3a8a" 
              font-family="Arial, sans-serif" font-size="24" font-weight="bold">MQ</text>
        
        <!-- Header Text -->
        <text x="${padding + 100}" y="${padding + 45}" fill="white" 
              font-family="Arial, sans-serif" font-size="24" font-weight="bold">MailQuill</text>
        <text x="${padding + 100}" y="${padding + 65}" fill="white" 
              font-family="Arial, sans-serif" font-size="14" font-weight="400" opacity="0.9">Email Marketing Platform</text>
        <text x="${padding + 100}" y="${padding + 85}" fill="white" 
              font-family="Arial, sans-serif" font-size="16" font-weight="600">PAYMENT RECEIPT</text>
        
        <!-- Receipt Number -->
        <text x="${width - padding - 20}" y="${padding + 45}" text-anchor="end" fill="white" 
              font-family="Arial, sans-serif" font-size="12" font-weight="400">Receipt #</text>
        <text x="${width - padding - 20}" y="${padding + 60}" text-anchor="end" fill="white" 
              font-family="Arial, sans-serif" font-size="14" font-weight="600">${payment.reference}</text>
        
        <!-- Content Area -->
        <g transform="translate(${padding + 30}, ${padding + 160})">
          <!-- Payment Summary -->
          <rect x="0" y="0" width="${width - 2 * padding - 60}" height="80" fill="url(#accentGradient)" rx="6" ry="6" stroke="#e5e7eb" stroke-width="1"/>
          <text x="20" y="25" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Payment Summary</text>
          <text x="20" y="45" fill="#374151" font-family="Arial, sans-serif" font-size="14" font-weight="400">Amount Paid</text>
          <text x="${width - 2 * padding - 60 - 20}" y="45" text-anchor="end" fill="#059669" 
                font-family="Arial, sans-serif" font-size="20" font-weight="bold">${formatCurrency(payment.amount)}</text>
          <text x="20" y="65" fill="#374151" font-family="Arial, sans-serif" font-size="14" font-weight="400">Status</text>
          <rect x="${width - 2 * padding - 60 - 80}" y="50" width="70" height="20" fill="#059669" rx="10" ry="10"/>
          <text x="${width - 2 * padding - 60 - 45}" y="63" text-anchor="middle" fill="white" 
                font-family="Arial, sans-serif" font-size="11" font-weight="600">${payment.status.toUpperCase()}</text>
          
          <!-- Payment Details -->
          <text x="0" y="120" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Payment Details</text>
          
          <!-- Details Table -->
          <g transform="translate(0, 140)">
            <!-- Reference Row -->
            <rect x="0" y="0" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="22" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Transaction Reference</text>
            <text x="${width - 2 * padding - 60 - 15}" y="22" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">${payment.reference}</text>
            
            <!-- Plan Row -->
            <rect x="0" y="35" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="57" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Subscription Plan</text>
            <text x="${width - 2 * padding - 60 - 15}" y="57" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">${payment.subscriptionTier.charAt(0).toUpperCase() + payment.subscriptionTier.slice(1)} - ${payment.billingCycle.charAt(0).toUpperCase() + payment.billingCycle.slice(1)}</text>
            
            <!-- Date Row -->
            <rect x="0" y="70" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="92" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Payment Date</text>
            <text x="${width - 2 * padding - 60 - 15}" y="92" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">${formatDate(payment.paidAt || payment.createdAt)}</text>
            
            <!-- Payment Method Row -->
            <rect x="0" y="105" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="127" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Payment Method</text>
            <text x="${width - 2 * padding - 60 - 15}" y="127" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">Paystack</text>
          </g>
          
          <!-- Customer Information -->
          <text x="0" y="320" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Customer Information</text>
          
          <!-- Customer Details Table -->
          <g transform="translate(0, 340)">
            <!-- Name Row -->
            <rect x="0" y="0" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="22" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Customer Name</text>
            <text x="${width - 2 * padding - 60 - 15}" y="22" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">${user.username}</text>
            
            <!-- Email Row -->
            <rect x="0" y="35" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
            <text x="15" y="57" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Email Address</text>
            <text x="${width - 2 * padding - 60 - 15}" y="57" text-anchor="end" fill="#111827" 
                  font-family="Arial, sans-serif" font-size="13" font-weight="500">${user.email}</text>
          </g>
          
          <!-- Footer -->
          <rect x="0" y="450" width="${width - 2 * padding - 60}" height="120" fill="#f8fafc" rx="6" ry="6" stroke="#e5e7eb" stroke-width="1"/>
          <text x="${(width - 2 * padding - 60) / 2}" y="480" text-anchor="middle" fill="#1e3a8a" 
                font-family="Arial, sans-serif" font-size="14" font-weight="bold">Thank you for your business!</text>
          <text x="${(width - 2 * padding - 60) / 2}" y="505" text-anchor="middle" fill="#6b7280" 
                font-family="Arial, sans-serif" font-size="12" font-weight="400">This receipt serves as proof of payment for your MailQuill subscription.</text>
          <text x="${(width - 2 * padding - 60) / 2}" y="525" text-anchor="middle" fill="#6b7280" 
                font-family="Arial, sans-serif" font-size="12" font-weight="400">Please keep this receipt for your records.</text>
          <text x="${(width - 2 * padding - 60) / 2}" y="550" text-anchor="middle" fill="#9ca3af" 
                font-family="Arial, sans-serif" font-size="10" font-weight="400">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</text>
        </g>
        
        <!-- Professional border -->
        <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#1e3a8a" stroke-width="2" rx="12" ry="12"/>
      </svg>
    `;

    // Convert SVG to PNG using Sharp
    const imageBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return imageBuffer;
  }
}
