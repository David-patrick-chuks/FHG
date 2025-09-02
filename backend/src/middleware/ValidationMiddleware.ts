import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';
import { ErrorHandler } from './ErrorHandler';

// Extend Request interface to include file property for multer
interface FileUploadRequest extends Request {
  file?: {
    mimetype: string;
    size: number;
    originalname?: string;
  };
}

export class ValidationMiddleware {
  private static logger: Logger = new Logger();

  public static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  public static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  public static validateCreateUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, username, password } = req.body;
      const errors: string[] = [];

      // Validate email
      if (!email || !this.validateEmail(email)) {
        errors.push('Valid email is required');
      }

      // Validate username
      if (!username) {
        errors.push('Username is required');
      } else {
        const usernameValidation = this.validateUsername(username);
        if (!usernameValidation.isValid) {
          errors.push(...usernameValidation.errors);
        }
      }

      // Validate password
      if (!password) {
        errors.push('Password is required');
      } else {
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
          errors.push(...passwordValidation.errors);
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Sanitize inputs
      req.body.email = this.sanitizeEmail(email);
      req.body.username = this.sanitizeString(username);

      next();
    } catch (error) {
      this.logger.error('Error in create user validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateLogin(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, password } = req.body;
      const errors: string[] = [];

      // Validate email
      if (!email || !this.validateEmail(email)) {
        errors.push('Valid email is required');
      }

      // Validate password
      if (!password) {
        errors.push('Password is required');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Sanitize email
      req.body.email = this.sanitizeEmail(email);

      next();
    } catch (error) {
      this.logger.error('Error in login validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateCreateBot(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, email, password, prompt } = req.body;
      const errors: string[] = [];

      // Validate name
      if (!name || name.trim().length < 2) {
        errors.push('Bot name must be at least 2 characters long');
      }

      if (name && name.trim().length > 100) {
        errors.push('Bot name must be no more than 100 characters long');
      }

      // Validate email
      if (!email || !this.validateEmail(email)) {
        errors.push('Valid email is required');
      }

      // Validate password
      if (!password) {
        errors.push('Password is required');
      }

      // Validate prompt
      if (!prompt || prompt.trim().length < 10) {
        errors.push('Bot prompt must be at least 10 characters long');
      }

      if (prompt && prompt.trim().length > 1000) {
        errors.push('Bot prompt must be no more than 1000 characters long');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Sanitize inputs
      req.body.name = this.sanitizeString(name);
      req.body.email = this.sanitizeEmail(email);
      req.body.prompt = this.sanitizeString(prompt);

      next();
    } catch (error) {
      this.logger.error('Error in create bot validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateCreateCampaign(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, description, emailList, prompt, botId } = req.body;
      const errors: string[] = [];

      // Validate name
      if (!name || name.trim().length < 2) {
        errors.push('Campaign name must be at least 2 characters long');
      }

      if (name && name.trim().length > 100) {
        errors.push('Campaign name must be no more than 100 characters long');
      }

      // Validate description (optional)
      if (description && description.trim().length > 1000) {
        errors.push('Campaign description must be no more than 1000 characters long');
      }

      // Validate email list
      if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
        errors.push('Email list is required and must contain at least one email');
      } else {
        if (emailList.length > 10000) {
          errors.push('Email list cannot exceed 10,000 emails');
        }

        for (let i = 0; i < emailList.length; i++) {
          if (!this.validateEmail(emailList[i])) {
            errors.push(`Invalid email at position ${i + 1}: ${emailList[i]}`);
          }
        }
      }

      // Validate prompt (optional)
      if (prompt && prompt.trim().length > 1000) {
        errors.push('Campaign prompt must be no more than 1000 characters long');
      }

      // Validate bot ID
      if (!botId) {
        errors.push('Bot ID is required');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Sanitize inputs
      req.body.name = this.sanitizeString(name);
      if (description) {
        req.body.description = this.sanitizeString(description);
      }
      if (prompt) {
        req.body.prompt = this.sanitizeString(prompt);
      }
      req.body.emailList = emailList.map((email: string) => this.sanitizeEmail(email));

      next();
    } catch (error) {
      this.logger.error('Error in create campaign validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateUpdateCampaign(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, description, emailList, prompt } = req.body;
      const errors: string[] = [];

      // Validate name (optional in updates)
      if (name !== undefined) {
        if (name.trim().length < 2) {
          errors.push('Campaign name must be at least 2 characters long');
        }

        if (name.trim().length > 100) {
          errors.push('Campaign name must be no more than 100 characters long');
        }
      }

      // Validate description (optional)
      if (description !== undefined && description.trim().length > 1000) {
        errors.push('Campaign description must be no more than 1000 characters long');
      }

      // Validate email list (optional in updates)
      if (emailList !== undefined) {
        if (!Array.isArray(emailList) || emailList.length === 0) {
          errors.push('Email list must contain at least one email');
        } else {
          if (emailList.length > 10000) {
            errors.push('Email list cannot exceed 10,000 emails');
          }

          for (let i = 0; i < emailList.length; i++) {
            if (!this.validateEmail(emailList[i])) {
              errors.push(`Invalid email at position ${i + 1}: ${emailList[i]}`);
            }
          }
        }
      }

      // Validate prompt (optional)
      if (prompt !== undefined && prompt.trim().length > 1000) {
        errors.push('Campaign prompt must be no more than 1000 characters long');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Sanitize inputs
      if (name !== undefined) {
        req.body.name = this.sanitizeString(name);
      }
      if (description !== undefined) {
        req.body.description = this.sanitizeString(description);
      }
      if (prompt !== undefined) {
        req.body.prompt = this.sanitizeString(prompt);
      }
      if (emailList !== undefined) {
        req.body.emailList = emailList.map((email: string) => this.sanitizeEmail(email));
      }

      next();
    } catch (error) {
      this.logger.error('Error in update campaign validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateCreateSubscription(req: Request, res: Response, next: NextFunction): void {
    try {
      const { tier, duration, amount, paymentMethod } = req.body;
      const errors: string[] = [];

      // Validate tier
      const validTiers = ['FREE', 'PRO', 'ENTERPRISE'];
      if (!tier || !validTiers.includes(tier)) {
        errors.push('Valid subscription tier is required');
      }

      // Validate duration
      if (!duration || duration < 1 || duration > 12) {
        errors.push('Duration must be between 1 and 12 months');
      }

      // Validate amount
      if (!amount || amount < 0) {
        errors.push('Valid amount is required');
      }

      // Validate payment method
      const validPaymentMethods = ['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER'];
      if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
        errors.push('Valid payment method is required');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.error('Error in create subscription validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateFileUpload(req: FileUploadRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'File is required',
          timestamp: new Date()
        });
        return;
      }

      const { mimetype, size } = req.file;

      // Validate file type
      const allowedTypes = ['text/csv', 'text/plain'];
      if (!allowedTypes.includes(mimetype)) {
        res.status(400).json({
          success: false,
          message: 'Only CSV and text files are allowed',
          timestamp: new Date()
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (size > maxSize) {
        res.status(400).json({
          success: false,
          message: 'File size must be less than 5MB',
          timestamp: new Date()
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.error('Error in file upload validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validatePagination(req: Request, res: Response, next: NextFunction): void {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const errors: string[] = [];

      // Validate page
      if (page !== undefined) {
        const pageNum = parseInt(page as string);
        if (isNaN(pageNum) || pageNum < 1) {
          errors.push('Page must be a positive number');
        }
      }

      // Validate limit
      if (limit !== undefined) {
        const limitNum = parseInt(limit as string);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          errors.push('Limit must be between 1 and 100');
        }
      }

      // Validate sortBy
      if (sortBy !== undefined && typeof sortBy !== 'string') {
        errors.push('SortBy must be a string');
      }

      // Validate sortOrder
      if (sortOrder !== undefined) {
        if (!['asc', 'desc'].includes(sortOrder as string)) {
          errors.push('SortOrder must be either "asc" or "desc"');
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      // Set default values
      if (!page) req.query['page'] = '1';
      if (!limit) req.query['limit'] = '10';
      if (!sortOrder) req.query['sortOrder'] = 'desc';

      next();
    } catch (error) {
      this.logger.error('Error in pagination validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static validateDateRange(req: Request, res: Response, next: NextFunction): void {
    try {
      const { startDate, endDate } = req.query;
      const errors: string[] = [];

      // Validate startDate
      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          errors.push('Start date must be a valid date');
        }
      }

      // Validate endDate
      if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          errors.push('End date must be a valid date');
        }
      }

      // Validate date range
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (start >= end) {
          errors.push('Start date must be before end date');
        }

        // Check if range is not too large (max 1 year)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > oneYear) {
          errors.push('Date range cannot exceed 1 year');
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date()
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.error('Error in date range validation:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        timestamp: new Date()
      });
    }
  }

  public static sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
    try {
      // Recursively sanitize all string values in request body
      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return this.sanitizeString(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeObject(item));
        }
        
        if (obj !== null && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }
        
        return obj;
      };

      if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeObject(req.body);
      }

      next();
    } catch (error) {
      this.logger.error('Error in request body sanitization:', error);
      next(); // Continue even if sanitization fails
    }
  }
}
