import { Logger } from '../utils/Logger';
import validator from 'validator';
import { URL } from 'url';
import { ValidationResult, UrlValidationOptions } from '../types';

export class ValidationService {
  private static logger: Logger = new Logger();

  /**
   * Sanitize and validate string input
   */
  public static validateString(
    value: any,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowEmpty?: boolean;
      trim?: boolean;
    } = {}
  ): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue: string | undefined;

    // Check if value exists
    if (value === null || value === undefined) {
      if (options.required) {
        errors.push('Value is required');
      }
      return { isValid: errors.length === 0, errors };
    }

    // Convert to string
    let stringValue = String(value);

    // Trim if requested
    if (options.trim !== false) {
      stringValue = stringValue.trim();
    }

    // Check if empty after trimming
    if (!options.allowEmpty && stringValue.length === 0) {
      if (options.required) {
        errors.push('Value cannot be empty');
      }
      return { isValid: errors.length === 0, errors };
    }

    // Length validation
    if (options.minLength && stringValue.length < options.minLength) {
      errors.push(`Value must be at least ${options.minLength} characters long`);
    }

    if (options.maxLength && stringValue.length > options.maxLength) {
      errors.push(`Value must be no more than ${options.maxLength} characters long`);
    }

    // Pattern validation
    if (options.pattern && !options.pattern.test(stringValue)) {
      errors.push('Value does not match required pattern');
    }

    // Sanitize HTML and XSS
    sanitizedValue = validator.escape(stringValue);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  /**
   * Validate and sanitize email address
   */
  public static validateEmail(email: any): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    const emailStr = String(email).trim().toLowerCase();

    if (!validator.isEmail(emailStr)) {
      errors.push('Invalid email format');
      return { isValid: false, errors };
    }

    // Additional email validation
    if (emailStr.length > 254) {
      errors.push('Email address is too long');
    }

    // Check for suspicious patterns
    if (emailStr.includes('..') || emailStr.startsWith('.') || emailStr.endsWith('.')) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: emailStr
    };
  }

  /**
   * Validate and sanitize URL with SSRF protection
   */
  public static validateUrl(
    url: any,
    options: UrlValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];
    const {
      allowedProtocols = ['http:', 'https:'],
      maxLength = 2048,
      allowLocalhost = false,
      allowPrivateIPs = false
    } = options;

    if (!url) {
      errors.push('URL is required');
      return { isValid: false, errors };
    }

    const urlStr = String(url).trim();

    // Length check
    if (urlStr.length > maxLength) {
      errors.push(`URL is too long (max ${maxLength} characters)`);
      return { isValid: false, errors };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlStr);
    } catch (error) {
      errors.push('Invalid URL format');
      return { isValid: false, errors };
    }

    // Protocol validation
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      errors.push(`Protocol must be one of: ${allowedProtocols.join(', ')}`);
    }

    // SSRF Protection - Check for private/local IPs
    if (!allowPrivateIPs) {
      const hostname = parsedUrl.hostname;
      
      // Check for localhost
      if (!allowLocalhost && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
        errors.push('Localhost URLs are not allowed');
      }

      // Check for private IP ranges
      if (this.isPrivateIP(hostname)) {
        errors.push('Private IP addresses are not allowed');
      }

      // Check for suspicious hostnames
      if (this.isSuspiciousHostname(hostname)) {
        errors.push('Suspicious hostname detected');
      }
    }

    // URL validation is handled by the native URL constructor above

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? parsedUrl.toString() : undefined
    };
  }

  /**
   * Validate array of URLs
   */
  public static validateUrlArray(
    urls: any,
    options: UrlValidationOptions & { maxCount?: number } = {}
  ): ValidationResult {
    const errors: string[] = [];
    const { maxCount = 50 } = options;

    if (!urls) {
      errors.push('URLs are required');
      return { isValid: false, errors };
    }

    let urlArray: string[];
    if (typeof urls === 'string') {
      urlArray = [urls];
    } else if (Array.isArray(urls)) {
      urlArray = urls;
    } else {
      errors.push('URLs must be provided as a string or array');
      return { isValid: false, errors };
    }

    if (urlArray.length === 0) {
      errors.push('At least one URL is required');
      return { isValid: false, errors };
    }

    if (urlArray.length > maxCount) {
      errors.push(`Maximum ${maxCount} URLs allowed per request`);
      return { isValid: false, errors };
    }

    const validUrls: string[] = [];
    const urlErrors: string[] = [];

    for (let i = 0; i < urlArray.length; i++) {
      const urlResult = this.validateUrl(urlArray[i], options);
      if (urlResult.isValid && urlResult.sanitizedValue) {
        validUrls.push(urlResult.sanitizedValue);
      } else {
        urlErrors.push(`URL ${i + 1}: ${urlResult.errors.join(', ')}`);
      }
    }

    if (urlErrors.length > 0) {
      errors.push(...urlErrors);
    }

    if (validUrls.length === 0) {
      errors.push('No valid URLs provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: validUrls
    };
  }

  /**
   * Validate enum values
   */
  public static validateEnum(
    value: any,
    allowedValues: string[],
    options: { required?: boolean; caseSensitive?: boolean } = {}
  ): ValidationResult {
    const errors: string[] = [];
    const { required = true, caseSensitive = false } = options;

    if (!value) {
      if (required) {
        errors.push('Value is required');
      }
      return { isValid: !required, errors };
    }

    const stringValue = String(value);
    const normalizedValue = caseSensitive ? stringValue : stringValue.toLowerCase();
    const normalizedAllowed = caseSensitive ? allowedValues : allowedValues.map(v => v.toLowerCase());

    if (!normalizedAllowed.includes(normalizedValue)) {
      errors.push(`Value must be one of: ${allowedValues.join(', ')}`);
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitizedValue: stringValue
    };
  }

  /**
   * Validate numeric input
   */
  public static validateNumber(
    value: any,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
      positive?: boolean;
    } = {}
  ): ValidationResult {
    const errors: string[] = [];
    const { required = true, integer = false, positive = false } = options;

    if (value === null || value === undefined || value === '') {
      if (required) {
        errors.push('Value is required');
      }
      return { isValid: !required, errors };
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push('Value must be a valid number');
      return { isValid: false, errors };
    }

    if (integer && !Number.isInteger(numValue)) {
      errors.push('Value must be an integer');
    }

    if (positive && numValue <= 0) {
      errors.push('Value must be positive');
    }

    if (options.min !== undefined && numValue < options.min) {
      errors.push(`Value must be at least ${options.min}`);
    }

    if (options.max !== undefined && numValue > options.max) {
      errors.push(`Value must be no more than ${options.max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: numValue
    };
  }

  /**
   * Check if IP address is private
   */
  private static isPrivateIP(hostname: string): boolean {
    // Check if it's an IP address
    if (!validator.isIP(hostname)) {
      return false;
    }

    const parts = hostname.split('.').map(Number);
    
    // IPv4 private ranges
    if (parts.length === 4) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
      
      // 127.0.0.0/8 (localhost)
      if (parts[0] === 127) return true;
      
      // 169.254.0.0/16 (link-local)
      if (parts[0] === 169 && parts[1] === 254) return true;
    }

    return false;
  }

  /**
   * Check for suspicious hostnames
   */
  private static isSuspiciousHostname(hostname: string): boolean {
    const suspiciousPatterns = [
      /^[0-9]+$/, // All numeric
      /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/, // IP address format
      /\.local$/i, // .local domains
      /\.internal$/i, // .internal domains
      /\.test$/i, // .test domains
      /\.example$/i, // .example domains
    ];

    return suspiciousPatterns.some(pattern => pattern.test(hostname));
  }

  /**
   * Sanitize object properties recursively
   */
  public static sanitizeObject(obj: any, maxDepth: number = 5): any {
    if (maxDepth <= 0) {
      return '[Max depth reached]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return validator.escape(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, maxDepth - 1));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = validator.escape(String(key));
        sanitized[sanitizedKey] = this.sanitizeObject(value, maxDepth - 1);
      }
      return sanitized;
    }

    return obj;
  }
}
