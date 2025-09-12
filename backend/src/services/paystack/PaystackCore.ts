import { Logger } from '../../utils/Logger';

export interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
      international_format_phone: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

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
