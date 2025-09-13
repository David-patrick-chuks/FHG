import { Types } from 'mongoose';
import { Logger } from '../utils/Logger';
import { ValidationService } from './ValidationService';
import { QuerySanitizationOptions } from '../types';

export class DatabaseSecurityService {
  private static logger: Logger = new Logger();

  // Allowed MongoDB operators for queries
  private static readonly ALLOWED_OPERATORS = [
    '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
    '$in', '$nin', '$exists', '$regex', '$options',
    '$and', '$or', '$nor', '$not',
    '$all', '$elemMatch', '$size'
  ];

  // Dangerous operators that should be blocked
  private static readonly BLOCKED_OPERATORS = [
    '$where', '$expr', '$jsonSchema', '$text', '$search',
    '$geoNear', '$near', '$nearSphere', '$geoWithin', '$geoIntersects',
    '$lookup', '$graphLookup', '$facet', '$bucket', '$bucketAuto',
    '$addFields', '$project', '$match', '$group', '$sort', '$limit', '$skip',
    '$out', '$merge', '$unionWith', '$replaceRoot', '$replaceWith'
  ];

  /**
   * Sanitize MongoDB query to prevent NoSQL injection
   */
  public static sanitizeQuery(
    query: any,
    options: QuerySanitizationOptions = {}
  ): any {
    const {
      allowRegex = false,
      maxDepth = 5,
      allowedOperators = this.ALLOWED_OPERATORS
    } = options;

    try {
      return this.sanitizeObject(query, maxDepth, allowedOperators, allowRegex);
    } catch (error: any) {
      this.logger.error('Query sanitization failed:', {
        message: error?.message,
        query: JSON.stringify(query)
      });
      throw new Error('Invalid query format');
    }
  }

  /**
   * Sanitize MongoDB ObjectId
   */
  public static sanitizeObjectId(id: any): Types.ObjectId | null {
    if (!id) return null;

    try {
      // Convert to string and validate
      const idStr = String(id).trim();
      
      if (!Types.ObjectId.isValid(idStr)) {
        this.logger.warn('Invalid ObjectId provided:', { id: idStr });
        return null;
      }

      return new Types.ObjectId(idStr);
    } catch (error: any) {
      this.logger.error('ObjectId sanitization failed:', {
        message: error?.message,
        id
      });
      return null;
    }
  }

  /**
   * Sanitize string for database queries
   */
  public static sanitizeString(value: any, maxLength: number = 1000): string | null {
    if (value === null || value === undefined) return null;

    try {
      const str = String(value).trim();
      
      if (str.length === 0) return null;
      if (str.length > maxLength) {
        this.logger.warn('String truncated due to length limit:', {
          originalLength: str.length,
          maxLength
        });
        return str.substring(0, maxLength);
      }

      // Remove null bytes and control characters
      const sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      return sanitized;
    } catch (error: any) {
      this.logger.error('String sanitization failed:', {
        message: error?.message,
        value
      });
      return null;
    }
  }

  /**
   * Sanitize number for database queries
   */
  public static sanitizeNumber(value: any, min?: number, max?: number): number | null {
    if (value === null || value === undefined) return null;

    try {
      const num = Number(value);
      
      if (isNaN(num) || !isFinite(num)) {
        this.logger.warn('Invalid number provided:', { value });
        return null;
      }

      if (min !== undefined && num < min) {
        this.logger.warn('Number below minimum:', { value: num, min });
        return min;
      }

      if (max !== undefined && num > max) {
        this.logger.warn('Number above maximum:', { value: num, max });
        return max;
      }

      return num;
    } catch (error: any) {
      this.logger.error('Number sanitization failed:', {
        message: error?.message,
        value
      });
      return null;
    }
  }

  /**
   * Sanitize date for database queries
   */
  public static sanitizeDate(value: any): Date | null {
    if (!value) return null;

    try {
      const date = new Date(value);
      
      if (isNaN(date.getTime())) {
        this.logger.warn('Invalid date provided:', { value });
        return null;
      }

      // Check for reasonable date range (not too far in past/future)
      const now = new Date();
      const minDate = new Date(1900, 0, 1);
      const maxDate = new Date(now.getFullYear() + 100, 11, 31);

      if (date < minDate || date > maxDate) {
        this.logger.warn('Date out of reasonable range:', { value, date });
        return null;
      }

      return date;
    } catch (error: any) {
      this.logger.error('Date sanitization failed:', {
        message: error?.message,
        value
      });
      return null;
    }
  }

  /**
   * Sanitize array for database queries
   */
  public static sanitizeArray(
    value: any,
    maxLength: number = 100,
    itemSanitizer?: (item: any) => any
  ): any[] | null {
    if (!Array.isArray(value)) return null;

    try {
      if (value.length > maxLength) {
        this.logger.warn('Array truncated due to length limit:', {
          originalLength: value.length,
          maxLength
        });
        value = value.slice(0, maxLength);
      }

      if (itemSanitizer) {
        return value.map(item => itemSanitizer(item)).filter(item => item !== null);
      }

      return value;
    } catch (error: any) {
      this.logger.error('Array sanitization failed:', {
        message: error?.message,
        value
      });
      return null;
    }
  }

  /**
   * Create a safe find query
   */
  public static createSafeFindQuery(
    baseQuery: any = {},
    userContext?: { userId?: string; isAdmin?: boolean }
  ): any {
    const sanitizedQuery = this.sanitizeQuery(baseQuery);

    // Add user context restrictions for non-admin users
    if (userContext && !userContext.isAdmin && userContext.userId) {
      sanitizedQuery.userId = this.sanitizeObjectId(userContext.userId);
    }

    return sanitizedQuery;
  }

  /**
   * Create a safe update query
   */
  public static createSafeUpdateQuery(
    updateData: any,
    options: { allowOperators?: boolean } = {}
  ): any {
    const { allowOperators = false } = options;

    if (allowOperators) {
      return this.sanitizeQuery(updateData, { allowRegex: false });
    }

    // For simple updates, only allow field assignments
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(updateData)) {
      const sanitizedKey = this.sanitizeString(key, 100);
      if (sanitizedKey && !sanitizedKey.startsWith('$')) {
        sanitized[sanitizedKey] = this.sanitizeValue(value);
      }
    }

    return sanitized;
  }

  /**
   * Recursively sanitize object for database queries
   */
  private static sanitizeObject(
    obj: any,
    maxDepth: number,
    allowedOperators: string[],
    allowRegex: boolean,
    currentDepth: number = 0
  ): any {
    if (currentDepth >= maxDepth) {
      this.logger.warn('Object sanitization depth limit reached');
      return {};
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number') {
      return this.sanitizeNumber(obj);
    }

    if (obj instanceof Date) {
      return this.sanitizeDate(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => 
        this.sanitizeObject(item, maxDepth, allowedOperators, allowRegex, currentDepth + 1)
      );
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key, 100);
        
        if (!sanitizedKey) continue;

        // Check for blocked operators
        if (this.BLOCKED_OPERATORS.includes(sanitizedKey)) {
          this.logger.warn('Blocked operator detected:', { operator: sanitizedKey });
          continue;
        }

        // Check for allowed operators
        if (sanitizedKey.startsWith('$')) {
          if (!allowedOperators.includes(sanitizedKey)) {
            this.logger.warn('Disallowed operator detected:', { operator: sanitizedKey });
            continue;
          }

          // Special handling for regex
          if (sanitizedKey === '$regex' && !allowRegex) {
            this.logger.warn('Regex operator blocked');
            continue;
          }
        }

        // Recursively sanitize value
        const sanitizedValue = this.sanitizeObject(
          value, 
          maxDepth, 
          allowedOperators, 
          allowRegex, 
          currentDepth + 1
        );

        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          sanitized[sanitizedKey] = sanitizedValue;
        }
      }

      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize a value based on its type
   */
  private static sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'number') {
      return this.sanitizeNumber(value);
    }

    if (value instanceof Date) {
      return this.sanitizeDate(value);
    }

    if (Array.isArray(value)) {
      return this.sanitizeArray(value);
    }

    if (typeof value === 'object') {
      return this.sanitizeQuery(value);
    }

    return value;
  }

  /**
   * Validate and sanitize pagination parameters
   */
  public static sanitizePagination(params: {
    page?: any;
    limit?: any;
    sort?: any;
  }): { page: number; limit: number; sort: any } {
    const page = this.sanitizeNumber(params.page, 1, 1000) || 1;
    const limit = this.sanitizeNumber(params.limit, 1, 100) || 10;
    
    let sort: any = {};
    if (params.sort) {
      const sortStr = this.sanitizeString(params.sort, 100);
      if (sortStr) {
        // Parse sort string (e.g., "name:1,createdAt:-1")
        const sortFields = sortStr.split(',');
        for (const field of sortFields) {
          const [fieldName, direction] = field.split(':');
          const sanitizedField = this.sanitizeString(fieldName, 50);
          const sanitizedDirection = this.sanitizeNumber(direction, -1, 1);
          
          if (sanitizedField && sanitizedDirection) {
            sort[sanitizedField] = sanitizedDirection;
          }
        }
      }
    }

    return { page, limit, sort };
  }
}
