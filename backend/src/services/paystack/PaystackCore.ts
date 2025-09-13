import { PaystackConfig, PaystackInitializeResponse, PaystackVerifyResponse } from '../../types';
import { Logger } from '../../utils/Logger';

export { PaystackConfig, PaystackInitializeResponse, PaystackVerifyResponse };

export class PaystackCore {
  protected static logger: Logger = new Logger();
  protected static config: PaystackConfig;

  protected static readonly SUBSCRIPTION_PRICES = {
    FREE: { monthly: 0, yearly: 0 },
    BASIC: { monthly: 1999, yearly: 19990 },
    PREMIUM: { monthly: 4999, yearly: 49990 },
    PRO: { monthly: 2999, yearly: 29990 },
    ENTERPRISE: { monthly: 9999, yearly: 99990 }
  };

  public static initialize(config: PaystackConfig): void {
    PaystackCore.config = config;
    PaystackCore.logger.info('Paystack service initialized');
  }

  protected static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MailQuill_${timestamp}_${random}`;
  }

  public static getSubscriptionPricing() {
    return PaystackCore.SUBSCRIPTION_PRICES;
  }
}
