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

    // Receipt dimensions
    const width = 450;
    const height = 600;
    const padding = 24;

    // Create SVG receipt
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#f8fafc"/>
        
        <!-- Receipt Card -->
        <rect x="${padding}" y="${padding}" width="${width - 2 * padding}" height="${height - 2 * padding}" 
              rx="16" ry="16" fill="white" stroke="#e2e8f0" stroke-width="1"/>
        
        <!-- Header Gradient Bar -->
        <rect x="${padding}" y="${padding}" width="${width - 2 * padding}" height="4" 
              fill="url(#headerGradient)" rx="2" ry="2"/>
        
        <!-- Header -->
        <rect x="${padding}" y="${padding + 4}" width="${width - 2 * padding}" height="120" 
              fill="url(#headerGradient)"/>
        
        <!-- Header Text -->
        <text x="${width / 2}" y="${padding + 60}" text-anchor="middle" fill="white" 
              font-family="Inter, sans-serif" font-size="28" font-weight="700">MailQuill</text>
        <text x="${width / 2}" y="${padding + 85}" text-anchor="middle" fill="white" 
              font-family="Inter, sans-serif" font-size="16" font-weight="500" opacity="0.9">Payment Receipt</text>
        
        <!-- Content Area -->
        <g transform="translate(${padding + 24}, ${padding + 140})">
          <!-- Payment Details Section -->
          <text x="0" y="0" fill="#1e293b" font-family="Inter, sans-serif" font-size="18" font-weight="600">Payment Details</text>
          
          <!-- Reference -->
          <rect x="0" y="25" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="45" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Reference</text>
          <text x="${width - 2 * padding - 48 - 16}" y="45" text-anchor="end" fill="#0f172a" 
                font-family="Inter, sans-serif" font-size="14" font-weight="600">${payment.reference}</text>
          
          <!-- Amount -->
          <rect x="0" y="75" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="95" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Amount</text>
          <text x="${width - 2 * padding - 48 - 16}" y="95" text-anchor="end" fill="#059669" 
                font-family="Inter, sans-serif" font-size="16" font-weight="700">${formatCurrency(payment.amount)}</text>
          
          <!-- Plan -->
          <rect x="0" y="125" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="145" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Plan</text>
          <text x="${width - 2 * padding - 48 - 16}" y="145" text-anchor="end" fill="#0f172a" 
                font-family="Inter, sans-serif" font-size="14" font-weight="600">${payment.subscriptionTier} - ${payment.billingCycle}</text>
          
          <!-- Date -->
          <rect x="0" y="175" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="195" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Date</text>
          <text x="${width - 2 * padding - 48 - 16}" y="195" text-anchor="end" fill="#0f172a" 
                font-family="Inter, sans-serif" font-size="14" font-weight="600">${formatDate(payment.paidAt || payment.createdAt)}</text>
          
          <!-- Status -->
          <rect x="0" y="225" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="245" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Status</text>
          <rect x="${width - 2 * padding - 48 - 80}" y="230" width="70" height="30" fill="#10b981" rx="15" ry="15"/>
          <text x="${width - 2 * padding - 48 - 45}" y="248" text-anchor="middle" fill="white" 
                font-family="Inter, sans-serif" font-size="12" font-weight="600">${payment.status.toUpperCase()}</text>
          
          <!-- Customer Information Section -->
          <text x="0" y="295" fill="#1e293b" font-family="Inter, sans-serif" font-size="18" font-weight="600">Customer Information</text>
          
          <!-- Name -->
          <rect x="0" y="320" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="340" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Name</text>
          <text x="${width - 2 * padding - 48 - 16}" y="340" text-anchor="end" fill="#0f172a" 
                font-family="Inter, sans-serif" font-size="14" font-weight="600">${user.username}</text>
          
          <!-- Email -->
          <rect x="0" y="370" width="${width - 2 * padding - 48}" height="40" fill="#f8fafc" rx="8" ry="8"/>
          <text x="16" y="390" fill="#64748b" font-family="Inter, sans-serif" font-size="14" font-weight="500">Email</text>
          <text x="${width - 2 * padding - 48 - 16}" y="390" text-anchor="end" fill="#0f172a" 
                font-family="Inter, sans-serif" font-size="14" font-weight="600">${user.email}</text>
          
          <!-- Footer -->
          <rect x="0" y="430" width="${width - 2 * padding - 48}" height="80" fill="#f8fafc" rx="12" ry="12" stroke="#e2e8f0" stroke-width="1"/>
          <text x="${(width - 2 * padding - 48) / 2}" y="450" text-anchor="middle" fill="#3B82F6" 
                font-family="Inter, sans-serif" font-size="16" font-weight="600">Thank you for choosing MailQuill!</text>
          <text x="${(width - 2 * padding - 48) / 2}" y="470" text-anchor="middle" fill="#64748b" 
                font-family="Inter, sans-serif" font-size="12" font-weight="500">This is your official payment receipt</text>
          <text x="${(width - 2 * padding - 48) / 2}" y="485" text-anchor="middle" fill="#94a3b8" 
                font-family="Inter, sans-serif" font-size="12" font-weight="400">Keep this receipt for your records</text>
        </g>
        
        <!-- Brand Accent -->
        <circle cx="${width - 50}" cy="${height - 50}" r="50" fill="url(#accentGradient)"/>
      </svg>
    `;

    // Convert SVG to PNG using Sharp
    const imageBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return imageBuffer;
  }
}
