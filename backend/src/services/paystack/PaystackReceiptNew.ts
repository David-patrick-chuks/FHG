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
            top: 60,
            bottom: 60,
            left: 60,
            right: 60
          }
        });

        // Collect PDF data
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header with modern branding
        doc.rect(0, 0, 495, 100)
           .fill('#1e40af');

        doc.fillColor('white')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('MailQuill', 60, 30);

        doc.fontSize(12)
           .font('Helvetica')
           .text('Email Marketing Platform', 60, 60);

        // Receipt title
        doc.fillColor('#1e40af')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('PAYMENT RECEIPT', 60, 120, { align: 'left' });

        // Receipt number
        doc.fillColor('#6b7280')
           .fontSize(10)
           .font('Helvetica')
           .text(`Receipt # ${safePayment.reference}`, 400, 70);

        // Payment summary box
        doc.rect(60, 160, 375, 90)
           .fill('#eff6ff')
           .stroke('#bfdbfe');

        doc.fillColor('#1e40af')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Payment Summary', 70, 170);

        doc.fillColor('#10b981')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text(formatCurrency(safePayment.amount), 70, 190);

        // Status badge
        doc.rect(300, 190, 90, 25)
           .fill('#10b981');

        doc.fillColor('white')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(safePayment.status.toUpperCase(), 305, 195);

        // Payment details section
        doc.fillColor('#1e40af')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Payment Details', 60, 270);

        doc.moveTo(60, 290)
           .lineTo(435, 290)
           .stroke('#e5e7eb');

        let yPosition = 310;

        // Payment details table
        const paymentDetails = [
          ['Transaction Ref', safePayment.reference],
          ['Subscription Plan', `${safePayment.subscriptionTier.charAt(0).toUpperCase() + safePayment.subscriptionTier.slice(1)} - ${safePayment.billingCycle.charAt(0).toUpperCase() + safePayment.billingCycle.slice(1)}`],
          ['Payment Date', formatDate(safePayment.paidAt)],
          ['Payment Method', 'Paystack'],
          ['Expires On', formatDate(expiryDate)]
        ];

        paymentDetails.forEach(([label, value]) => {
          doc.fillColor('#6b7280')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(label, 60, yPosition);

          doc.fillColor('#374151')
             .font('Helvetica')
             .text(value, 200, yPosition);

          yPosition += 20;
        });

        // Customer information section
        yPosition += 30;
        doc.fillColor('#1e40af')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Customer Information', 60, yPosition);

        yPosition += 20;
        doc.moveTo(60, yPosition)
           .lineTo(435, yPosition)
           .stroke('#e5e7eb');

        yPosition += 20;

        // Customer details
        const customerDetails = [
          ['Customer Name', safeUser.username.charAt(0).toUpperCase() + safeUser.username.slice(1)],
          ['Email Address', safeUser.email]
        ];

        customerDetails.forEach(([label, value]) => {
          doc.fillColor('#6b7280')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(label, 60, yPosition);

          doc.fillColor('#374151')
             .font('Helvetica')
             .text(value, 200, yPosition);

          yPosition += 20;
        });

        // Footer
        yPosition += 40;
        doc.rect(60, yPosition, 375, 60)
           .fill('#f9fafb');

        doc.fillColor('#1e40af')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Thank you for choosing MailQuill!', 60, yPosition + 10, { align: 'left' });

        doc.fillColor('#6b7280')
           .fontSize(10)
           .font('Helvetica')
           .text('This receipt serves as proof of payment for your subscription.', 60, yPosition + 25, { align: 'left' });

        doc.text('Please keep this receipt for your records.', 60, yPosition + 35, { align: 'left' });

        // Watermark
        doc.fillColor('#1e40af', 0.1)
           .fontSize(50)
           .font('Helvetica-Bold')
           .text('MailQuill', 60, 400, { align: 'center' });

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