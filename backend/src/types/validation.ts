// Validation Types

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface UrlValidationOptions {
  allowedProtocols?: string[];
  maxLength?: number;
  allowLocalhost?: boolean;
  allowPrivateIPs?: boolean;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedContent?: string;
}

export interface QuerySanitizationOptions {
  allowRegex?: boolean;
  maxDepth?: number;
  allowedOperators?: string[];
}

export interface EnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  config: Partial<import('./common').EnvironmentConfig>;
}
