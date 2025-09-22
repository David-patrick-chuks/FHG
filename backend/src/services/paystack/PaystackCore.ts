import { PaystackConfig, PaystackInitializeResponse, PaystackVerifyResponse } from '../../types';
import { Logger } from '../../utils/Logger';

export { PaystackConfig, PaystackInitializeResponse, PaystackVerifyResponse };

export class PaystackCore {
  protected static logger: Logger = new Logger();
  protected static config: PaystackConfig;

  protected static readonly SUBSCRIPTION_PRICES = {
    basic: { monthly: 2999, yearly: 28790 }, // 20% off: 2999 * 12 * 0.8 = 28790
    premium: { monthly: 9999, yearly: 95990 } // 20% off: 9999 * 12 * 0.8 = 95990
  };

  public static initialize(config: PaystackConfig): void {
    PaystackCore.config = config;
    // Only log Paystack initialization in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      PaystackCore.logger.debug('Paystack service initialized');
    }
  }

  protected static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MailQuill_${timestamp}_${random}`;
  }

  public static getSubscriptionPricing() {
    // Ensure we always return a valid pricing object
    if (!PaystackCore.SUBSCRIPTION_PRICES) {
      PaystackCore.logger.error('SUBSCRIPTION_PRICES is undefined');
      return {
        basic: { monthly: 2999, yearly: 28790 },
        premium: { monthly: 9999, yearly: 95990 }
      };
    }
    return PaystackCore.SUBSCRIPTION_PRICES;
  }
}
