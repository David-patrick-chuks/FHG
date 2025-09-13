// Subscription and Limits Types

export interface SubscriptionLimits {
  dailyExtractionLimit: number;
  canUseCsvUpload: boolean;
  planName: string;
  isUnlimited: boolean;
  expiresAt: Date;
}

export interface UsageStats {
  used: number;
  remaining: number;
  resetTime: Date;
  limit: number;
}
