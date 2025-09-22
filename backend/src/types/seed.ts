// Seed Data Types

import { SubscriptionTier, BillingCycle } from './common';

export interface AdminUserData {
  email: string;
  username: string;
  password: string;
  subscription: SubscriptionTier;
  billingCycle: BillingCycle;
  isAdmin: boolean;
  isActive: boolean;
}

export interface SeedUserData {
  email: string;
  username: string;
  password: string;
  subscription: SubscriptionTier;
  billingCycle: BillingCycle;
  isAdmin: boolean;
  isActive: boolean;
}
