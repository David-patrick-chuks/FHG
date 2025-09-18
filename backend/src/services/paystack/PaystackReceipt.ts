import sharp from 'sharp';
import PaymentModel from '../../models/Payment';
import UserModel from '../../models/User';
import { ApiResponse } from '../../types';
import { PaystackCore } from './PaystackCore';
import path from 'path';
import fs from 'fs';

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
  }private static async generateReceiptImage(payment: any, user: any): Promise<Buffer> {
  // XML escape function (unchanged)
  const xmlEscape = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate expiry date (unchanged)
  const paymentDate = payment.paidAt || payment.createdAt;
  const expiryDate = new Date(paymentDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  // Safe data extraction (unchanged)
  const safePayment = {
    reference: xmlEscape(payment.reference || 'N/A'),
    amount: payment.amount || 0,
    status: xmlEscape(payment.status || 'unknown'),
    subscriptionTier: xmlEscape(payment.subscriptionTier || 'basic'),
    billingCycle: xmlEscape(payment.billingCycle || 'monthly'),
    paidAt: payment.paidAt || payment.createdAt
  };

  const safeUser = {
    username: xmlEscape(user.username || 'User'),
    email: xmlEscape(user.email || 'user@example.com')
  };

  // Read and process the MailQuill logo
  const logoPath = path.join(process.cwd(), 'public', 'MailQuill.svg');
  let logoData = '';
  try {
    let logoContent = fs.readFileSync(logoPath, 'utf8');
    
    // Clean up: Remove XML declaration, DOCTYPE, metadata (unchanged)
    logoContent = logoContent
      .replace(/<?xml[^>]*>/g, '')
      .replace(/<!DOCTYPE[^>]*>/g, '')
      .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
      .trim();

    // NEW: Strip outer <svg> tags to get only inner content (fixes nesting/mismatch)
    logoData = logoContent.replace(/^<svg[^>]*>/i, '').replace(/<\/svg>$/i, '').trim();

    // Apply color replace (unchanged)
    logoData = logoData.replace(/fill="#000000"/g, 'fill="#1e3a8a"');

    // No need for width/height/viewBox replaces anymore; we'll use transform scale below
  } catch (error) {
    PaystackReceipt.logger.warn('Could not load MailQuill logo, using fallback', { error: error instanceof Error ? error.message : 'Unknown error' });
    logoData = '';  // Fallback to text logo
  }

  // Receipt dimensions (unchanged)
  const width = 600;
  const height = 800;
  const padding = 40;

  // NEW: Calculate logo scale based on assumed original size (275x282); adjust to fit 40x40
  const logoScale = 40 / 275;  // ~0.145; tweak if logo dimensions differ

  // Create professional SVG receipt (minor tweaks for logo insertion)
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
      ${logoData ? `
      <g transform="translate(${padding + 30}, ${padding + 30}) scale(${logoScale})">
        ${logoData}
      </g>
      ` : `
      <text x="${padding + 50}" y="${padding + 45}" text-anchor="middle" fill="#1e3a8a" 
            font-family="Arial, sans-serif" font-size="24" font-weight="bold">MQ</text>
      `}
      
      <!-- Header Text - Centered (unchanged) -->
      <text x="${width / 2}" y="${padding + 50}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="24" font-weight="bold">MailQuill</text>
      <text x="${width / 2}" y="${padding + 70}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="14" font-weight="400" opacity="0.9">Email Marketing Platform</text>
      <text x="${width / 2}" y="${padding + 90}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="16" font-weight="600">PAYMENT RECEIPT</text>
      
      <text x="${width - padding - 20}" y="${padding + 100}" text-anchor="end" fill="white" 
            font-family="Arial, sans-serif" font-size="12" font-weight="400">Receipt # ${safePayment.reference}</text>
      
      <!-- Content Area (unchanged) -->
      <g transform="translate(${padding + 30}, ${padding + 160})">
        <!-- Payment Summary -->
        <rect x="0" y="0" width="${width - 2 * padding - 60}" height="80" fill="url(#accentGradient)" rx="6" ry="6" stroke="#e5e7eb" stroke-width="1"/>
        <text x="20" y="25" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Payment Summary</text>
        <text x="20" y="45" fill="#374151" font-family="Arial, sans-serif" font-size="14" font-weight="400">Amount Paid</text>
        <text x="${width - 2 * padding - 60 - 20}" y="45" text-anchor="end" fill="#059669" 
              font-family="Arial, sans-serif" font-size="20" font-weight="bold">${formatCurrency(safePayment.amount)}</text>
        <text x="20" y="65" fill="#374151" font-family="Arial, sans-serif" font-size="14" font-weight="400">Status</text>
        <rect x="${width - 2 * padding - 60 - 90}" y="50" width="90" height="20" fill="#059669" rx="10" ry="10"/>
        <text x="${width - 2 * padding - 60 - 45}" y="63" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="11" font-weight="600">${safePayment.status.toUpperCase()}</text>
        
        <!-- Payment Details (unchanged) -->
        <text x="0" y="120" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Payment Details</text>
        
        <!-- Details Table (unchanged) -->
        <g transform="translate(0, 140)">
          <rect x="0" y="0" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="22" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Transaction Reference</text>
          <text x="${width - 2 * padding - 60 - 15}" y="22" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${safePayment.reference}</text>
          
          <rect x="0" y="35" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="57" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Subscription Plan</text>
          <text x="${width - 2 * padding - 60 - 15}" y="57" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${safePayment.subscriptionTier.charAt(0).toUpperCase() + safePayment.subscriptionTier.slice(1)} - ${safePayment.billingCycle.charAt(0).toUpperCase() + safePayment.billingCycle.slice(1)}</text>
          
          <rect x="0" y="70" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="92" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Payment Date</text>
          <text x="${width - 2 * padding - 60 - 15}" y="92" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${formatDate(safePayment.paidAt)}</text>
          
          <rect x="0" y="105" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="127" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Payment Method</text>
          <text x="${width - 2 * padding - 60 - 15}" y="127" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">Paystack</text>
          
          <rect x="0" y="140" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="162" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Expires On</text>
          <text x="${width - 2 * padding - 60 - 15}" y="162" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${formatDate(expiryDate)}</text>
        </g>
        
        <!-- Customer Information (unchanged) -->
        <text x="0" y="355" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Customer Information</text>
        
        <!-- Customer Details Table (unchanged) -->
        <g transform="translate(0, 375)">
          <rect x="0" y="0" width="${width - 2 * padding - 60}" height="35" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="22" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Customer Name</text>
          <text x="${width - 2 * padding - 60 - 15}" y="22" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${safeUser.username.charAt(0).toUpperCase() + safeUser.username.slice(1)}</text>
          
          <rect x="0" y="35" width="${width - 2 * padding - 60}" height="35" fill="white" stroke="#e5e7eb" stroke-width="1"/>
          <text x="15" y="57" fill="#6b7280" font-family="Arial, sans-serif" font-size="13" font-weight="400">Email Address</text>
          <text x="${width - 2 * padding - 60 - 15}" y="57" text-anchor="end" fill="#111827" 
                font-family="Arial, sans-serif" font-size="13" font-weight="500">${safeUser.email}</text>
        </g>
        
        <!-- Footer (unchanged) -->
        <rect x="0" y="485" width="${width - 2 * padding - 60}" height="120" fill="#f8fafc" rx="6" ry="6" stroke="#e5e7eb" stroke-width="1"/>
        <text x="${(width - 2 * padding - 60) / 2}" y="515" text-anchor="middle" fill="#1e3a8a" 
              font-family="Arial, sans-serif" font-size="14" font-weight="bold">Thank you for choosing MailQuill!</text>
        <text x="${(width - 2 * padding - 60) / 2}" y="540" text-anchor="middle" fill="#6b7280" 
              font-family="Arial, sans-serif" font-size="12" font-weight="400">This receipt serves as proof of payment for your MailQuill subscription.</text>
        <text x="${(width - 2 * padding - 60) / 2}" y="560" text-anchor="middle" fill="#6b7280" 
              font-family="Arial, sans-serif" font-size="12" font-weight="400">Please keep this receipt for your records.</text>
        <text x="${(width - 2 * padding - 60) / 2}" y="585" text-anchor="middle" fill="#9ca3af" 
              font-family="Arial, sans-serif" font-size="10" font-weight="400">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</text>
      </g>
      
      <!-- Professional border (unchanged) -->
      <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#1e3a8a" stroke-width="2" rx="12" ry="12"/>
      
      <!-- Watermark -->
      <g opacity="0.1" transform="translate(${width / 2 - 100}, ${height / 2 - 50})">
        ${logoData ? `
        <g transform="scale(2 * ${logoScale})">  <!-- Adjust scale for larger watermark -->
          ${logoData}
        </g>
        ` : `
        <text x="100" y="50" text-anchor="middle" fill="#1e3a8a" 
              font-family="Arial, sans-serif" font-size="48" font-weight="bold">MailQuill</text>
        `}
      </g>
    </svg>
  `;

  try {
    // Convert SVG to PNG using Sharp (unchanged)
    const imageBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return imageBuffer;
  } catch (error) {
    PaystackReceipt.logger.error('Error converting SVG to PNG:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      svgLength: svg.length,
      svgContent: svg.substring(0, 500) + '...'  // Log snippet for debugging
    });
    
    // Fallback: create a simple receipt without complex SVG (unchanged)
    const fallbackSvg = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="300" y="50" text-anchor="middle" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="24" font-weight="bold">MailQuill Payment Receipt</text>
        <text x="50" y="100" fill="#374151" font-family="Arial, sans-serif" font-size="16">Reference: ${safePayment.reference}</text>
        <text x="50" y="130" fill="#374151" font-family="Arial, sans-serif" font-size="16">Amount: ${formatCurrency(safePayment.amount)}</text>
        <text x="50" y="160" fill="#374151" font-family="Arial, sans-serif" font-size="16">Status: ${safePayment.status}</text>
        <text x="50" y="190" fill="#374151" font-family="Arial, sans-serif" font-size="16">Customer: ${safeUser.username}</text>
        <text x="50" y="220" fill="#374151" font-family="Arial, sans-serif" font-size="16">Email: ${safeUser.email}</text>
        <text x="50" y="250" fill="#374151" font-family="Arial, sans-serif" font-size="16">Date: ${formatDate(safePayment.paidAt)}</text>
        <text x="300" y="350" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="12">Thank you for choosing MailQuill!</text>
      </svg>
    `;
    
    return await sharp(Buffer.from(fallbackSvg))
      .png()
      .toBuffer();
  }
}


}
