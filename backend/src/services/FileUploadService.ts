import { Request } from 'express';
import multer from 'multer';
import { Logger } from '../utils/Logger';
import { ValidationService } from './ValidationService';
import { FileValidationOptions, FileValidationResult } from '../types';

export class FileUploadService {
  private static logger: Logger = new Logger();

  // Default file size limit: 5MB
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
  
  // Allowed CSV MIME types
  private static readonly CSV_MIME_TYPES = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel'
  ];

  // Allowed CSV extensions
  private static readonly CSV_EXTENSIONS = ['.csv', '.txt'];

  /**
   * Create multer configuration for secure file uploads
   */
  public static createUploadMiddleware(options: FileValidationOptions = {}) {
    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      allowedMimeTypes = this.CSV_MIME_TYPES,
      allowedExtensions = this.CSV_EXTENSIONS,
      maxFiles = 1
    } = options;

    const storage = multer.memoryStorage();

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      try {
        // Check file size
        if (file.size && file.size > maxSize) {
          this.logger.warn('File upload rejected - size too large', {
            filename: file.originalname,
            size: file.size,
            maxSize,
            userId: (req as any).user?.id
          });
          return cb(new Error(`File size exceeds ${maxSize} bytes limit`));
        }

        // Check MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
          this.logger.warn('File upload rejected - invalid MIME type', {
            filename: file.originalname,
            mimetype: file.mimetype,
            allowedMimeTypes,
            userId: (req as any).user?.id
          });
          return cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
        }

        // Check file extension
        const fileExtension = this.getFileExtension(file.originalname);
        if (!allowedExtensions.includes(fileExtension)) {
          this.logger.warn('File upload rejected - invalid extension', {
            filename: file.originalname,
            extension: fileExtension,
            allowedExtensions,
            userId: (req as any).user?.id
          });
          return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
        }

        // Check for suspicious filename patterns
        if (this.isSuspiciousFilename(file.originalname)) {
          this.logger.warn('File upload rejected - suspicious filename', {
            filename: file.originalname,
            userId: (req as any).user?.id
          });
          return cb(new Error('Suspicious filename detected'));
        }

        this.logger.info('File upload accepted', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          userId: (req as any).user?.id
        });

        cb(null, true);
      } catch (error: any) {
        this.logger.error('File filter error:', {
          message: error?.message,
          filename: file.originalname,
          userId: (req as any).user?.id
        });
        cb(new Error('File validation failed'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: maxSize,
        files: maxFiles,
        fieldSize: 1024 * 1024, // 1MB for field data
        fieldNameSize: 100,
        fields: 10
      }
    });
  }

  /**
   * Validate CSV file content
   */
  public static validateCsvFile(
    file: Express.Multer.File,
    options: {
      maxRows?: number;
      maxColumns?: number;
      requiredColumns?: string[];
      maxCellLength?: number;
    } = {}
  ): FileValidationResult {
    const errors: string[] = [];
    const {
      maxRows = 10000,
      maxColumns = 100,
      requiredColumns = [],
      maxCellLength = 1000
    } = options;

    try {
      // Convert buffer to string
      const content = file.buffer.toString('utf-8');
      
      if (!content || content.trim().length === 0) {
        errors.push('File is empty');
        return { isValid: false, errors };
      }

      // Check content length
      if (content.length > 10 * 1024 * 1024) { // 10MB content limit
        errors.push('File content is too large');
        return { isValid: false, errors };
      }

      // Split into lines
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length === 0) {
        errors.push('No valid data rows found');
        return { isValid: false, errors };
      }

      if (lines.length > maxRows) {
        errors.push(`Too many rows. Maximum ${maxRows} rows allowed`);
        return { isValid: false, errors };
      }

      // Parse first line as header
      const headerLine = lines[0];
      const headers = this.parseCsvLine(headerLine);
      
      if (headers.length === 0) {
        errors.push('No valid headers found');
        return { isValid: false, errors };
      }

      if (headers.length > maxColumns) {
        errors.push(`Too many columns. Maximum ${maxColumns} columns allowed`);
        return { isValid: false, errors };
      }

      // Check required columns
      for (const requiredCol of requiredColumns) {
        if (!headers.some(header => header.toLowerCase() === requiredCol.toLowerCase())) {
          errors.push(`Required column '${requiredCol}' not found`);
        }
      }

      // Validate data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cells = this.parseCsvLine(line);
        
        if (cells.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${cells.length})`);
        }

        // Check cell content length
        for (let j = 0; j < cells.length; j++) {
          if (cells[j].length > maxCellLength) {
            errors.push(`Row ${i + 1}, Column ${j + 1}: Cell content too long (max ${maxCellLength} characters)`);
          }

          // Check for suspicious content
          if (this.isSuspiciousCellContent(cells[j])) {
            errors.push(`Row ${i + 1}, Column ${j + 1}: Suspicious content detected`);
          }
        }
      }

      // Sanitize content
      const sanitizedContent = this.sanitizeCsvContent(content);

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedContent
      };

    } catch (error: any) {
      this.logger.error('CSV validation error:', {
        message: error?.message,
        filename: file.originalname
      });
      
      return {
        isValid: false,
        errors: ['File validation failed: ' + (error?.message || 'Unknown error')]
      };
    }
  }

  /**
   * Parse CSV line with proper escaping
   */
  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current.trim());

    return result;
  }

  /**
   * Sanitize CSV content
   */
  private static sanitizeCsvContent(content: string): string {
    const lines = content.split('\n');
    const sanitizedLines = lines.map(line => {
      const cells = this.parseCsvLine(line);
      const sanitizedCells = cells.map(cell => {
        // Remove null bytes and control characters
        let sanitized = cell.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Escape HTML
        sanitized = ValidationService.sanitizeObject(sanitized) as string;
        
        // Limit length
        if (sanitized.length > 1000) {
          sanitized = sanitized.substring(0, 1000);
        }
        
        return sanitized;
      });
      
      return sanitizedCells.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
    });

    return sanitizedLines.join('\n');
  }

  /**
   * Check for suspicious filename patterns
   */
  private static isSuspiciousFilename(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|jsp)$/i, // Executable extensions
      /^\./, // Hidden files
      /\.{2,}/, // Multiple dots
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Check for suspicious cell content
   */
  private static isSuspiciousCellContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i, // Script tags
      /javascript:/i, // JavaScript URLs
      /data:text\/html/i, // Data URLs
      /vbscript:/i, // VBScript
      /onload=/i, // Event handlers
      /onerror=/i,
      /onclick=/i,
      /eval\(/i, // Eval function
      /expression\(/i, // CSS expressions
      /url\(javascript:/i, // JavaScript in CSS
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  /**
   * Extract URLs from CSV content
   */
  public static extractUrlsFromCsv(content: string): string[] {
    try {
      const lines = content.split('\n');
      const urls: string[] = [];
      
      // Skip header row if it contains 'url'
      const startIndex = lines[0].toLowerCase().includes('url') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue;
        
        const cells = this.parseCsvLine(line);
        
        for (const cell of cells) {
          const trimmedCell = cell.trim();
          if (trimmedCell.length > 0) {
            // Basic URL validation
            if (this.looksLikeUrl(trimmedCell)) {
              urls.push(trimmedCell);
            }
          }
        }
      }
      
      return urls;
    } catch (error: any) {
      this.logger.error('Error extracting URLs from CSV:', {
        message: error?.message
      });
      return [];
    }
  }

  /**
   * Check if string looks like a URL
   */
  private static looksLikeUrl(str: string): boolean {
    // Basic URL pattern check
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return urlPattern.test(str) && str.length > 3 && str.length < 2048;
  }

  /**
   * Parse uploaded file and extract emails
   */
  public static async parseFile(buffer: Buffer, mimetype: string): Promise<{ 
    emails: string[]; 
    totalRows: number; 
    totalCount: number; 
    validCount: number; 
    invalidEmails: string[] 
  }> {
    try {
      const content = buffer.toString('utf-8');
      const emails: string[] = [];
      const invalidEmails: string[] = [];
      let totalRows = 0;

      // Validate file type
      if (!this.CSV_MIME_TYPES.includes(mimetype)) {
        throw new Error('Invalid file type. Only CSV files are allowed.');
      }

      // Parse CSV content
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      totalRows = lines.length;

      // Skip header row if it contains 'email'
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue;

        const cells = this.parseCsvLine(line);
        
        for (const cell of cells) {
          const trimmedCell = cell.trim();
          if (trimmedCell.length > 0) {
            // Basic email validation
            if (this.looksLikeEmail(trimmedCell)) {
              emails.push(trimmedCell.toLowerCase());
            } else {
              invalidEmails.push(trimmedCell);
            }
          }
        }
      }

      // Remove duplicates
      const uniqueEmails = [...new Set(emails)];
      const uniqueInvalidEmails = [...new Set(invalidEmails)];

      this.logger.info('File parsed successfully', {
        totalRows,
        emailsFound: uniqueEmails.length,
        invalidEmailsFound: uniqueInvalidEmails.length,
        duplicatesRemoved: emails.length - uniqueEmails.length
      });

      return {
        emails: uniqueEmails,
        totalRows,
        totalCount: totalRows,
        validCount: uniqueEmails.length,
        invalidEmails: uniqueInvalidEmails
      };

    } catch (error: any) {
      this.logger.error('File parsing error:', {
        message: error?.message,
        mimetype
      });
      throw new Error('Failed to parse file: ' + (error?.message || 'Unknown error'));
    }
  }

  /**
   * Check if string looks like an email
   */
  private static looksLikeEmail(str: string): boolean {
    // Basic email pattern check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(str) && str.length > 5 && str.length < 254;
  }
}