import mongoose, { Document, Model, Schema } from 'mongoose';
import { ITemplate, TemplateCategory, TemplateStatus } from '../types';

export interface ITemplateDocument extends Omit<ITemplate, '_id'>, Document {
  approveTemplate(): Promise<void>;
  rejectTemplate(reason: string): Promise<void>;
  publishTemplate(): Promise<void>;
  unpublishTemplate(): Promise<void>;
  addSample(sample: any): Promise<void>;
  removeSample(sampleId: string): Promise<void>;
  incrementUsageCount(): Promise<void>;
  getUsageStats(): { totalUsage: number; recentUsage: number };
}

export interface ITemplateModel extends Model<ITemplateDocument> {
  findByUserId(userId: string): Promise<ITemplateDocument[]>;
  findPublishedTemplates(): Promise<ITemplateDocument[]>;
  findTemplatesByCategory(category: TemplateCategory): Promise<ITemplateDocument[]>;
  findTemplatesByStatus(status: TemplateStatus): Promise<ITemplateDocument[]>;
  findPopularTemplates(limit?: number): Promise<ITemplateDocument[]>;
  findTemplatesBySearch(query: string): Promise<ITemplateDocument[]>;
}

export class TemplateModel {
  private static instance: ITemplateModel;

  public static getInstance(): ITemplateModel {
    if (!TemplateModel.instance) {
      TemplateModel.instance = TemplateModel.createModel();
    }
    return TemplateModel.instance;
  }

  private static createModel(): ITemplateModel {
    const templateSchema = new Schema<ITemplateDocument>({
      userId: {
        type: String,
        required: true,
        ref: 'User'
      },
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
      },
      description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
      },
      category: {
        type: String,
        enum: Object.values(TemplateCategory),
        required: true
      },
      industry: {
        type: String,
        trim: true,
        maxlength: 50
      },
      targetAudience: {
        type: String,
        trim: true,
        maxlength: 100
      },
      status: {
        type: String,
        enum: Object.values(TemplateStatus),
        default: TemplateStatus.DRAFT
      },
      isPublic: {
        type: Boolean,
        default: false
      },
      isApproved: {
        type: Boolean,
        default: false
      },
      approvedBy: {
        type: String,
        ref: 'User'
      },
      approvedAt: {
        type: Date
      },
      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500
      },
      useCase: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
      },
      variables: [{
        key: {
          type: String,
          required: true,
          trim: true,
          minlength: 1,
          maxlength: 50
        },
        value: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200
        },
        required: {
          type: Boolean,
          default: false
        }
      }],
      tags: [{
        type: String,
        trim: true,
        maxlength: 30
      }],
      usageCount: {
        type: Number,
        default: 0
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      },
      reviews: [{
        userId: {
          type: String,
          required: true,
          ref: 'User'
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          trim: true,
          maxlength: 500
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      featured: {
        type: Boolean,
        default: false
      },
      featuredAt: {
        type: Date
      },
      originalTemplateId: {
        type: String,
        ref: 'Template'
      },
      samples: [{
        subject: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200
        },
        body: {
          type: String,
          required: true,
          trim: true,
          maxlength: 5000
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    }, {
      timestamps: true
    });

    // Indexes
    templateSchema.index({ userId: 1 });
    templateSchema.index({ status: 1 });
    templateSchema.index({ category: 1 });
    templateSchema.index({ isPublic: 1, isApproved: 1 });
    templateSchema.index({ usageCount: -1 });
    templateSchema.index({ 'rating.average': -1 });
    templateSchema.index({ featured: -1, featuredAt: -1 });
    templateSchema.index({ tags: 1 });
    templateSchema.index({ name: 'text', description: 'text', tags: 'text' });

    // Compound indexes
    templateSchema.index({ isPublic: 1, isApproved: 1, status: 1 });
    templateSchema.index({ category: 1, isPublic: 1, isApproved: 1 });
    templateSchema.index({ userId: 1, status: 1 });

    // Instance methods
    templateSchema.methods['approveTemplate'] = async function(): Promise<void> {
      if (this.status !== TemplateStatus.PENDING_APPROVAL) {
        throw new Error('Template must be in PENDING_APPROVAL status to approve');
      }
      
      this.status = TemplateStatus.APPROVED;
      this.isApproved = true;
      this.approvedAt = new Date();
      await this.save();
    };

    templateSchema.methods['rejectTemplate'] = async function(reason: string): Promise<void> {
      if (this.status !== TemplateStatus.PENDING_APPROVAL) {
        throw new Error('Template must be in PENDING_APPROVAL status to reject');
      }
      
      this.status = TemplateStatus.REJECTED;
      this.isApproved = false;
      this.rejectionReason = reason;
      await this.save();
    };

    templateSchema.methods['publishTemplate'] = async function(): Promise<void> {
      if (this.status !== TemplateStatus.APPROVED) {
        throw new Error('Template must be approved before publishing');
      }
      
      this.isPublic = true;
      await this.save();
    };

    templateSchema.methods['unpublishTemplate'] = async function(): Promise<void> {
      this.isPublic = false;
      await this.save();
    };

    templateSchema.methods['addSample'] = async function(sample: any): Promise<void> {
      if (this.samples.length >= 20) {
        throw new Error('Maximum 20 samples allowed per template');
      }
      
      this.samples.push(sample);
      await this.save();
    };

    templateSchema.methods['removeSample'] = async function(sampleId: string): Promise<void> {
      this.samples = this.samples.filter((sample: any) => sample._id.toString() !== sampleId);
      await this.save();
    };

    templateSchema.methods['incrementUsageCount'] = async function(): Promise<void> {
      this.usageCount += 1;
      await this.save();
    };

    templateSchema.methods['getUsageStats'] = function(): { totalUsage: number; recentUsage: number } {
      const recentUsage = this.usageCount; // This could be enhanced with time-based tracking
      return {
        totalUsage: this.usageCount,
        recentUsage
      };
    };

    // Static methods
    templateSchema.statics['findByUserId'] = function(userId: string): Promise<ITemplateDocument[]> {
      return this.find({ userId }).sort({ createdAt: -1 });
    };

    templateSchema.statics['findPublishedTemplates'] = function(): Promise<ITemplateDocument[]> {
      return this.find({ 
        isPublic: true, 
        isApproved: true, 
        status: TemplateStatus.APPROVED 
      }).sort({ usageCount: -1, 'rating.average': -1 });
    };

    templateSchema.statics['findTemplatesByCategory'] = function(category: TemplateCategory): Promise<ITemplateDocument[]> {
      return this.find({ 
        category, 
        isPublic: true, 
        isApproved: true, 
        status: TemplateStatus.APPROVED 
      }).sort({ usageCount: -1, 'rating.average': -1 });
    };

    templateSchema.statics['findTemplatesByStatus'] = function(status: TemplateStatus): Promise<ITemplateDocument[]> {
      return this.find({ status }).sort({ createdAt: -1 });
    };

    templateSchema.statics['findPopularTemplates'] = function(limit: number = 10): Promise<ITemplateDocument[]> {
      return this.find({ 
        isPublic: true, 
        isApproved: true, 
        status: TemplateStatus.APPROVED 
      }).sort({ usageCount: -1, 'rating.average': -1 }).limit(limit);
    };

    templateSchema.statics['findTemplatesBySearch'] = function(query: string): Promise<ITemplateDocument[]> {
      return this.find({
        $text: { $search: query },
        isPublic: true,
        isApproved: true,
        status: TemplateStatus.APPROVED
      }).sort({ score: { $meta: 'textScore' } });
    };

    return mongoose.model<ITemplateDocument, ITemplateModel>('Template', templateSchema);
  }
}

// Export the model instance
export default TemplateModel.getInstance();
