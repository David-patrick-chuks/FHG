import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { ContactService } from '../services/ContactService';
import { Logger } from '../utils/Logger';

export class ContactController {
  private static logger: Logger = new Logger();

  /**
   * Submit contact form
   * @route POST /contact
   * @access Public
   */
  public static async submitContactForm(req: Request, res: Response): Promise<void> {
    try {
      ContactController.logger.info('Contact form submission attempt', {
        email: req.body.email,
        subject: req.body.subject,
        ip: req.ip
      });

      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        res.status(400).json({
          success: false,
          message: 'All fields are required',
          timestamp: new Date()
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
          timestamp: new Date()
        });
        return;
      }

      // Send contact form email
      await ContactService.sendContactFormEmail({
        name,
        email,
        subject,
        message,
        ip: req.ip || 'Unknown'
      });

      ContactController.logger.info('Contact form submitted successfully', {
        email: req.body.email,
        subject: req.body.subject
      });

      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        timestamp: new Date()
      });

    } catch (error) {
      ContactController.logger.error('Contact form submission failed:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
