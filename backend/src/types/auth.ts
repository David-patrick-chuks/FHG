// Authentication and Authorization Types

import { Request } from 'express';

// JWT Types
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin: boolean;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Authenticated User Interface
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  subscriptionTier: string;
  subscriptionExpiresAt?: Date;
  isAdmin: boolean;
}

// Extended Request Interface
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// File Upload Request Interface
export interface FileUploadRequest extends Request {
  file?: any; // Using any for now to avoid type conflicts
}
