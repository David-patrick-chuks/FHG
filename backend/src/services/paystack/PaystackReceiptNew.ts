import PDFDocument from 'pdfkit';
import PaymentModel from '../../models/Payment';
import UserModel from '../../models/User';
import { ApiResponse } from '../../types';
import { PaystackCore } from './PaystackCore';

export class PaystackReceiptNew extends PaystackCore {
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

      // Generate PDF receipt using pdfkit
      const pdfBuffer = await PaystackReceiptNew.generateReceiptPDF(payment, user);

      return {
        success: true,
        message: 'Receipt generated successfully',
        data: pdfBuffer,
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackReceiptNew.logger.error('Error generating receipt:', {
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

    // Calculate expiry date
    const expiryDate = new Date(payment.paidAt);
    if (payment.billingCycle === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Sanitize data to prevent XSS
    const safePayment = {
      reference: payment.reference || 'N/A',
      amount: payment.amount || 0,
      status: payment.status || 'unknown',
      subscriptionTier: payment.subscriptionTier || 'unknown',
      billingCycle: payment.billingCycle || 'unknown',
      paidAt: payment.paidAt || new Date()
    };

    const safeUser = {
      username: user.username || 'User',
      email: user.email || 'user@example.com'
    };

    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Collect PDF data
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header with brand colors
        doc.rect(0, 0, 595, 100)
           .fill('#1e3a8a');

        // Logo placeholder (we'll use text for now)
        doc.fillColor('white')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('MQ', 50, 30);

        // Company name and tagline
        doc.fillColor('white')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('MailQuill', 100, 25);

        doc.fontSize(12)
           .font('Helvetica')
           .text('Email Marketing Platform', 100, 50);

        // Receipt title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('PAYMENT RECEIPT', 0, 80, { align: 'center' });

        // Receipt number
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica')
           .text(`Receipt # ${safePayment.reference}`, 450, 30);

        // Payment summary box
        doc.rect(50, 120, 495, 80)
           .fill('#e6f0ff')
           .stroke('#cce0ff');

        doc.fillColor('#1e3a8a')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Payment Summary', 70, 130);

        doc.fillColor('#059669')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text(formatCurrency(safePayment.amount), 0, 150, { align: 'center' });

        // Status badge
        doc.rect(250, 170, 80, 20)
           .fill('#059669');

        doc.fillColor('white')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(safePayment.status.toUpperCase(), 0, 175, { align: 'center' });

        // Payment details section
        doc.fillColor('black')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Payment Details', 50, 230);

        // Draw line under section title
        doc.moveTo(50, 250)
           .lineTo(545, 250)
           .stroke('#e0e0e0');

        let yPosition = 270;

        // Payment details table
        const paymentDetails = [
          ['Transaction Reference', safePayment.reference],
          ['Subscription Plan', `${safePayment.subscriptionTier.charAt(0).toUpperCase() + safePayment.subscriptionTier.slice(1)} - ${safePayment.billingCycle.charAt(0).toUpperCase() + safePayment.billingCycle.slice(1)}`],
          ['Payment Date', formatDate(safePayment.paidAt)],
          ['Payment Method', 'Paystack'],
          ['Expires On', formatDate(expiryDate)]
        ];

        paymentDetails.forEach(([label, value]) => {
          doc.fillColor('#555')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(label, 50, yPosition);

          doc.fillColor('#333')
             .font('Helvetica')
             .text(value, 200, yPosition);

          yPosition += 20;
        });

        // Customer information section
        yPosition += 20;
        doc.fillColor('black')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Customer Information', 50, yPosition);

        yPosition += 20;
        doc.moveTo(50, yPosition)
           .lineTo(545, yPosition)
           .stroke('#e0e0e0');

        yPosition += 20;

        // Customer details
        const customerDetails = [
          ['Customer Name', safeUser.username.charAt(0).toUpperCase() + safeUser.username.slice(1)],
          ['Email Address', safeUser.email]
        ];

        customerDetails.forEach(([label, value]) => {
          doc.fillColor('#555')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(label, 50, yPosition);

          doc.fillColor('#333')
             .font('Helvetica')
             .text(value, 200, yPosition);

          yPosition += 20;
        });

        // Footer
        yPosition += 40;
        doc.rect(0, yPosition, 595, 50)
           .fill('#f4f7f6');

        doc.fillColor('#1e3a8a')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Thank you for choosing MailQuill!', 0, yPosition + 10, { align: 'center' });

        doc.fillColor('#777')
           .fontSize(10)
           .font('Helvetica')
           .text('This receipt serves as proof of payment for your MailQuill subscription.', 0, yPosition + 25, { align: 'center' });

        doc.text('Please keep this receipt for your records.', 0, yPosition + 35, { align: 'center' });

        // Watermark
        doc.fillColor('#1e3a8a', 0.1)
           .fontSize(60)
           .font('Helvetica-Bold')
           .text('MailQuill', 0, 300, { 
             align: 'center',
             // angle: -45  // Removed because 'angle' is not a valid TextOptions property in pdfkit
           });

        // Finalize the PDF
        doc.end();

      } catch (error) {
        PaystackReceiptNew.logger.error('Error generating PDF with pdfkit:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        reject(error);
      }
    });
  }
}
