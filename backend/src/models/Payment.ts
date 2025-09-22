import mongoose, { Document, Model, Schema } from 'mongoose';
import { IPayment, PaymentMethod, PaymentStatus } from '../types';
import { Logger } from '../utils/Logger';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {
  updateStatus(status: PaymentStatus): Promise<void>;
  markAsCompleted(transactionData: any): Promise<void>;
  markAsFailed(errorMessage: string): Promise<void>;
}

export interface IPaymentModel extends Model<IPaymentDocument> {
  findByUserId(userId: string): Promise<IPaymentDocument[]>;
  findByReference(reference: string): Promise<IPaymentDocument | null>;
  findByPaystackReference(paystackReference: string): Promise<IPaymentDocument | null>;
  findPendingPayments(): Promise<IPaymentDocument[]>;
  findCompletedPayments(): Promise<IPaymentDocument[]>;
  getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  }>;
}

export class PaymentModel {
  private static instance: IPaymentModel;
  private static logger: Logger = new Logger();

  public static getInstance(): IPaymentModel {
    if (!PaymentModel.instance) {
      PaymentModel.instance = PaymentModel.createModel();
    }
    return PaymentModel.instance;
  }

  private static createModel(): IPaymentModel {
    const paymentSchema = new Schema<IPaymentDocument>({
      userId: {
        type: String,
        required: true,
        index: true
      },
      subscriptionTier: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        required: true
      },
      billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'NGN',
        required: true
      },
      status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
        index: true
      },
      paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true
      },
      reference: {
        type: String,
        required: true,
        unique: true,
        index: true
      },
      paystackReference: {
        type: String,
        sparse: true,
        index: true
      },
      paystackAccessCode: {
        type: String,
        sparse: true
      },
      authorizationUrl: {
        type: String,
        sparse: true
      },
      transactionId: {
        type: String,
        sparse: true
      },
      gatewayResponse: {
        type: String,
        sparse: true
      },
      paidAt: {
        type: Date,
        sparse: true
      },
      failureReason: {
        type: String,
        sparse: true
      },
      metadata: {
        type: Schema.Types.Mixed,
        default: {}
      },
      subscriptionExpiresAt: {
        type: Date,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }, {
      timestamps: true,
      collection: 'payments',
      toJSON: {
        transform: function(doc, ret) {
          ret._id = (ret._id as any).toString();
          return ret;
        }
      }
    });

    // Indexes for better query performance
    paymentSchema.index({ userId: 1, createdAt: -1 });
    paymentSchema.index({ status: 1, createdAt: -1 });
    paymentSchema.index({ subscriptionTier: 1, status: 1 });
    paymentSchema.index({ paidAt: -1 });

    // Instance methods
    paymentSchema.methods['updateStatus'] = async function(status: PaymentStatus): Promise<void> {
      this.status = status;
      await this.save();
      PaymentModel.logger.info(`Payment ${this.reference} status updated to ${status}`);
    };

    paymentSchema.methods['markAsCompleted'] = async function(transactionData: any): Promise<void> {
      this.status = PaymentStatus.COMPLETED;
      this.paidAt = new Date();
      this.transactionId = transactionData.id?.toString();
      this.gatewayResponse = transactionData.gateway_response;
      this.paystackReference = transactionData.reference;
      this.metadata = { ...this.metadata, transactionData };
      await this.save();
      PaymentModel.logger.info(`Payment ${this.reference} marked as completed`);
    };

    paymentSchema.methods['markAsFailed'] = async function(errorMessage: string): Promise<void> {
      this.status = PaymentStatus.FAILED;
      this.failureReason = errorMessage;
      await this.save();
      PaymentModel.logger.error(`Payment ${this.reference} marked as failed: ${errorMessage}`);
    };

    // Static methods
    paymentSchema.statics['findByUserId'] = function(userId: string): Promise<IPaymentDocument[]> {
      return this.find({ userId }).sort({ createdAt: -1 });
    };

    paymentSchema.statics['findByReference'] = function(reference: string): Promise<IPaymentDocument | null> {
      return this.findOne({ reference });
    };

    paymentSchema.statics['findByPaystackReference'] = function(paystackReference: string): Promise<IPaymentDocument | null> {
      return this.findOne({ paystackReference });
    };

    paymentSchema.statics['findPendingPayments'] = function(): Promise<IPaymentDocument[]> {
      return this.find({ status: PaymentStatus.PENDING }).sort({ createdAt: -1 });
    };

    paymentSchema.statics['findCompletedPayments'] = function(): Promise<IPaymentDocument[]> {
      return this.find({ status: PaymentStatus.COMPLETED }).sort({ paidAt: -1 });
    };

    paymentSchema.statics['getPaymentStats'] = async function(): Promise<{
      totalPayments: number;
      totalAmount: number;
      successfulPayments: number;
      failedPayments: number;
      pendingPayments: number;
    }> {
      const [totalPayments, totalAmount, successfulPayments, failedPayments, pendingPayments] = await Promise.all([
        this.countDocuments(),
        this.aggregate([
          { $match: { status: PaymentStatus.COMPLETED } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        this.countDocuments({ status: PaymentStatus.COMPLETED }),
        this.countDocuments({ status: PaymentStatus.FAILED }),
        this.countDocuments({ status: PaymentStatus.PENDING })
      ]);

      return {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        pendingPayments
      };
    };

    return mongoose.model<IPaymentDocument, IPaymentModel>('Payment', paymentSchema);
  }
}

export default PaymentModel.getInstance();
