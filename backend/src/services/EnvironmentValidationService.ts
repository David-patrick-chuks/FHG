import { Logger } from '../utils/Logger';
import { EnvironmentConfig, EnvironmentValidationResult } from '../types';

export class EnvironmentValidationService {
  private static logger: Logger = new Logger();

  /**
   * Validate all required environment variables
   */
  public static validateEnvironment(): EnvironmentValidationResult {
    const errors: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Required environment variables
    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'JWT_SECRET',
      'MONGODB_URI',
      'FRONTEND_URL',
      'PAYSTACK_SECRET_KEY',
      'PAYSTACK_PUBLIC_KEY'
    ];

    // Validate required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        errors.push(`Required environment variable ${varName} is not set`);
        continue;
      }

      // Type-specific validation
      switch (varName) {
        case 'NODE_ENV':
          if (!['development', 'production', 'test'].includes(value)) {
            errors.push(`Invalid NODE_ENV value: ${value}. Must be development, production, or test`);
          } else {
            config.NODE_ENV = value;
          }
          break;

        case 'PORT':
          const port = parseInt(value, 10);
          if (isNaN(port) || port < 1 || port > 65535) {
            errors.push(`Invalid PORT value: ${value}. Must be a number between 1 and 65535`);
          } else {
            config.PORT = port;
          }
          break;

        case 'JWT_SECRET':
          const jwtValidation = this.validateJwtSecret(value);
          if (!jwtValidation.isValid) {
            errors.push(`Invalid JWT_SECRET: ${jwtValidation.reason}`);
          } else {
            config.JWT_SECRET = value;
          }
          break;

        case 'MONGODB_URI':
          if (!this.isValidMongoUri(value)) {
            errors.push('Invalid MONGODB_URI format');
          } else {
            config.MONGODB_URI = value;
          }
          break;

        case 'FRONTEND_URL':
          if (!this.isValidUrl(value)) {
            errors.push('Invalid FRONTEND_URL format');
          } else {
            config.FRONTEND_URL = value;
          }
          break;

        case 'PAYSTACK_SECRET_KEY':
          if (!this.isValidPaystackKey(value, 'secret')) {
            errors.push('Invalid PAYSTACK_SECRET_KEY format');
          } else {
            config.PAYSTACK_SECRET_KEY = value;
          }
          break;

        case 'PAYSTACK_PUBLIC_KEY':
          if (!this.isValidPaystackKey(value, 'public')) {
            errors.push('Invalid PAYSTACK_PUBLIC_KEY format');
          } else {
            config.PAYSTACK_PUBLIC_KEY = value;
          }
          break;

        default:
          (config as any)[varName] = value;
      }
    }

    // Validate optional variables
    this.validateOptionalVariables(config, errors);

    // Log validation results
    if (errors.length > 0) {
      this.logger.error('Environment validation failed:', { errors });
    } else {
      this.logger.info('Environment validation passed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      config
    };
  }

  /**
   * Validate optional environment variables
   */
  private static validateOptionalVariables(config: Partial<EnvironmentConfig>, errors: string[]): void {
    // Rate limiting configuration
    if (process.env['RATE_LIMIT_WINDOW_MS']) {
      const windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'], 10);
      if (isNaN(windowMs) || windowMs < 1000) {
        errors.push('RATE_LIMIT_WINDOW_MS must be a number >= 1000');
      } else {
        config.RATE_LIMIT_WINDOW_MS = windowMs;
      }
    }

    if (process.env['RATE_LIMIT_MAX_REQUESTS']) {
      const maxRequests = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'], 10);
      if (isNaN(maxRequests) || maxRequests < 1) {
        errors.push('RATE_LIMIT_MAX_REQUESTS must be a number >= 1');
      } else {
        config.RATE_LIMIT_MAX_REQUESTS = maxRequests;
      }
    }
  }

  /**
   * Validate JWT secret strength
   */
  private static validateJwtSecret(secret: string): { isValid: boolean; reason?: string } {
    if (secret.length < 32) {
      return { isValid: false, reason: 'JWT secret must be at least 32 characters long' };
    }

    // Check for common weak secrets
    const weakSecrets = [
      'secret',
      'password',
      '123456',
      'jwt-secret',
      'your-secret-key',
      'change-this-secret'
    ];

    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
      return { isValid: false, reason: 'JWT secret appears to be weak or default' };
    }

    // Check entropy (rough estimate)
    const uniqueChars = new Set(secret).size;
    const entropy = Math.log2(uniqueChars);
    
    if (entropy < 4.0) {
      return { isValid: false, reason: 'JWT secret has insufficient entropy' };
    }

    return { isValid: true };
  }

  /**
   * Validate MongoDB URI format
   */
  private static isValidMongoUri(uri: string): boolean {
    try {
      // Basic MongoDB URI format validation
      const mongoUriRegex = /^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/;
      const localMongoRegex = /^mongodb:\/\/localhost:\d+\/(.+)$/;
      
      return mongoUriRegex.test(uri) || localMongoRegex.test(uri);
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Paystack key format
   */
  private static isValidPaystackKey(key: string, type: 'secret' | 'public'): boolean {
    if (!key) return false;

    if (type === 'secret') {
      // Paystack secret keys start with 'sk_'
      return key.startsWith('sk_') && key.length > 10;
    } else {
      // Paystack public keys start with 'pk_'
      return key.startsWith('pk_') && key.length > 10;
    }
  }

  /**
   * Get environment variable with validation
   */
  public static getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name];
    
    if (!value && defaultValue === undefined) {
      throw new Error(`Required environment variable ${name} is not set`);
    }

    return value || defaultValue!;
  }

  /**
   * Get environment variable as number with validation
   */
  public static getEnvNumber(name: string, defaultValue?: number): number {
    const value = process.env[name];
    
    if (!value && defaultValue === undefined) {
      throw new Error(`Required environment variable ${name} is not set`);
    }

    const numValue = value ? parseInt(value, 10) : defaultValue!;
    
    if (isNaN(numValue)) {
      throw new Error(`Environment variable ${name} must be a valid number`);
    }

    return numValue;
  }

  /**
   * Get environment variable as boolean
   */
  public static getEnvBoolean(name: string, defaultValue?: boolean): boolean {
    const value = process.env[name];
    
    if (!value && defaultValue === undefined) {
      throw new Error(`Required environment variable ${name} is not set`);
    }

    if (!value) return defaultValue!;

    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }

  /**
   * Check if running in production
   */
  public static isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production';
  }

  /**
   * Check if running in development
   */
  public static isDevelopment(): boolean {
    return process.env['NODE_ENV'] === 'development';
  }

  /**
   * Check if running in test
   */
  public static isTest(): boolean {
    return process.env['NODE_ENV'] === 'test';
  }

  /**
   * Get sanitized environment info for logging (without secrets)
   */
  public static getSanitizedEnvInfo(): Record<string, any> {
    return {
      NODE_ENV: process.env['NODE_ENV'],
      PORT: process.env['PORT'],
      MONGODB_URI: this.sanitizeMongoUri(process.env['MONGODB_URI']),
      FRONTEND_URL: process.env['FRONTEND_URL'],
      JWT_SECRET_LENGTH: process.env['JWT_SECRET']?.length || 0,
      PAYSTACK_SECRET_KEY_PREFIX: process.env['PAYSTACK_SECRET_KEY']?.substring(0, 5) + '...',
      PAYSTACK_PUBLIC_KEY_PREFIX: process.env['PAYSTACK_PUBLIC_KEY']?.substring(0, 5) + '...',
      RATE_LIMIT_WINDOW_MS: process.env['RATE_LIMIT_WINDOW_MS'],
      RATE_LIMIT_MAX_REQUESTS: process.env['RATE_LIMIT_MAX_REQUESTS']
    };
  }

  /**
   * Sanitize MongoDB URI for logging
   */
  private static sanitizeMongoUri(uri: string | undefined): string | undefined {
    if (!uri) return undefined;
    
    // Replace password with asterisks
    return uri.replace(/:([^:@]+)@/, ':***@');
  }
}
