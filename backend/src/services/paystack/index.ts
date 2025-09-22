import { PaystackConfig } from './PaystackCore';
import { PaystackPayment } from './PaystackPayment';
import { PaystackReceiptNew as PaystackReceipt } from './PaystackReceiptNew';
import { PaystackSubscription } from './PaystackSubscription';

export class PaystackService {
  // Initialize the service
  public static initialize(config: PaystackConfig): void {
    PaystackPayment.initialize(config);
  }

  // Payment methods
  public static initializePayment = PaystackPayment.initializePayment;
  public static verifyPayment = PaystackPayment.verifyPayment;
  public static getUserPayments = PaystackPayment.getUserPayments;
  public static getAllPayments = PaystackPayment.getAllPayments;
  public static getPaymentStats = PaystackPayment.getPaymentStats;

  // Receipt methods
  public static generateReceipt = PaystackReceipt.generateReceipt;

  // Subscription methods
  public static getCurrentSubscription = PaystackSubscription.getCurrentSubscription;
  public static cancelSubscription = PaystackSubscription.cancelSubscription;
  public static canUpgrade = PaystackSubscription.canUpgrade;
  public static getSubscriptionFeatures = PaystackSubscription.getSubscriptionFeatures;

  // Pricing
  public static getSubscriptionPricing = PaystackPayment.getSubscriptionPricing;
}

// Re-export types and classes for external use
export { PaystackConfig } from './PaystackCore';
export { PaystackPayment } from './PaystackPayment';
export { PaystackReceiptNew as PaystackReceipt } from './PaystackReceiptNew';
export { PaystackSubscription } from './PaystackSubscription';
