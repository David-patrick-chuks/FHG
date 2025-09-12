import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/Logger';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JwtService {
  private static logger: Logger = new Logger();
  private static blacklistedTokens: Set<string> = new Set();
  
  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
  private static readonly REFRESH_TOKEN_EXPIRY_REMEMBER_ME = '30d'; // 30 days for remember me
  
  // Minimum secret strength requirements
  private static readonly MIN_SECRET_LENGTH = 32;
  private static readonly MIN_SECRET_ENTROPY = 4.0;

  /**
   * Validate JWT secret strength
   */
  public static validateSecret(secret: string): { isValid: boolean; reason?: string } {
    if (!secret) {
      return { isValid: false, reason: 'JWT secret is required' };
    }

    if (secret.length < this.MIN_SECRET_LENGTH) {
      return { 
        isValid: false, 
        reason: `JWT secret must be at least ${this.MIN_SECRET_LENGTH} characters long` 
      };
    }

    // Check entropy (rough estimate)
    const uniqueChars = new Set(secret).size;
    const entropy = Math.log2(uniqueChars);
    
    if (entropy < this.MIN_SECRET_ENTROPY) {
      return { 
        isValid: false, 
        reason: 'JWT secret has insufficient entropy. Use a more random secret.' 
      };
    }

    return { isValid: true };
  }

  /**
   * Get JWT secret with validation
   */
  private static getSecret(): string {
    const secret = process.env['JWT_SECRET'];
    
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const validation = this.validateSecret(secret);
    if (!validation.isValid) {
      throw new Error(`Invalid JWT secret: ${validation.reason}`);
    }

    return secret;
  }

  /**
   * Generate secure token pair
   */
  public static generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>, rememberMe: boolean = false): TokenPair {
    try {
      const secret = this.getSecret();
      
      // Generate access token
      const accessToken = jwt.sign(payload, secret, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256',
        issuer: 'email-outreach-bot',
        audience: 'email-outreach-bot-api'
      });

      // Generate refresh token with different payload and expiration based on rememberMe
      const refreshPayload = {
        userId: payload.userId,
        type: 'refresh',
        tokenId: crypto.randomUUID()
      };

      const refreshExpiry = rememberMe ? this.REFRESH_TOKEN_EXPIRY_REMEMBER_ME : this.REFRESH_TOKEN_EXPIRY;
      
      const refreshToken = jwt.sign(refreshPayload, secret, {
        expiresIn: refreshExpiry,
        algorithm: 'HS256',
        issuer: 'email-outreach-bot',
        audience: 'email-outreach-bot-api'
      });

      // Calculate expiration time
      const decoded = jwt.decode(accessToken) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      this.logger.info('Token pair generated', {
        userId: payload.userId,
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        refreshExpiry,
        rememberMe
      });

      return {
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error: any) {
      this.logger.error('Error generating token pair:', {
        message: error?.message,
        stack: error?.stack
      });
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Verify and decode access token
   */
  public static verifyAccessToken(token: string): JwtPayload {
    try {
      const secret = this.getSecret();
      
      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'email-outreach-bot',
        audience: 'email-outreach-bot-api'
      }) as JwtPayload;

      // Validate payload structure
      if (!decoded.userId || !decoded.email || !decoded.username) {
        throw new Error('Invalid token payload');
      }

      return decoded;
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new Error('Token not active');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  public static verifyRefreshToken(token: string): { userId: string; tokenId: string } {
    try {
      const secret = this.getSecret();
      
      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'email-outreach-bot',
        audience: 'email-outreach-bot-api'
      }) as any;

      // Validate refresh token structure
      if (!decoded.userId || !decoded.type || decoded.type !== 'refresh' || !decoded.tokenId) {
        throw new Error('Invalid refresh token');
      }

      return {
        userId: decoded.userId,
        tokenId: decoded.tokenId
      };
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Blacklist a token (for logout)
   */
  public static blacklistToken(token: string): void {
    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        // Only blacklist if token hasn't expired
        if (expirationTime > now) {
          this.blacklistedTokens.add(token);
          
          // Schedule removal after expiration
          setTimeout(() => {
            this.blacklistedTokens.delete(token);
          }, expirationTime - now);
          
          this.logger.info('Token blacklisted', {
            tokenId: decoded.jti || 'unknown',
            expiresAt: new Date(expirationTime)
          });
        }
      }
    } catch (error: any) {
      this.logger.error('Error blacklisting token:', {
        message: error?.message
      });
    }
  }

  /**
   * Clear all blacklisted tokens (for testing/development)
   */
  public static clearBlacklist(): void {
    this.blacklistedTokens.clear();
    this.logger.info('Token blacklist cleared');
  }

  /**
   * Get blacklist statistics
   */
  public static getBlacklistStats(): { count: number } {
    return { count: this.blacklistedTokens.size };
  }

  /**
   * Extract token from request cookies (HTTP-only cookies)
   */
  public static extractToken(req: any): string | null {
    // First try to get from HTTP-only cookie
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for backward compatibility
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}
