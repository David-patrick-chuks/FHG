import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IIncident {
  _id?: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  updates: IIncidentUpdate[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface IIncidentUpdate {
  timestamp: Date;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  author?: string;
}

export interface IIncidentDocument extends Omit<IIncident, '_id'>, Document {
  addUpdate(message: string, status: 'investigating' | 'identified' | 'monitoring' | 'resolved', author?: string): Promise<void>;
  resolve(): Promise<void>;
  isResolved(): boolean;
  getDuration(): number; // in minutes
}

export interface IIncidentModel extends Model<IIncidentDocument> {
  createIncident(incidentData: Partial<IIncident>): Promise<IIncidentDocument>;
  getActiveIncidents(): Promise<IIncidentDocument[]>;
  getRecentIncidents(limit?: number): Promise<IIncidentDocument[]>;
  getIncidentsByStatus(status: string): Promise<IIncidentDocument[]>;
}

export class IncidentModel {
  private static instance: IIncidentModel;

  public static getInstance(): IIncidentModel {
    if (!IncidentModel.instance) {
      IncidentModel.instance = IncidentModel.createModel();
    }
    return IncidentModel.instance;
  }

  private static createModel(): IIncidentModel {
    const incidentUpdateSchema = new Schema<IIncidentUpdate>({
      timestamp: {
        type: Date,
        default: Date.now,
        required: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      status: {
        type: String,
        enum: ['investigating', 'identified', 'monitoring', 'resolved'],
        required: true
      },
      author: {
        type: String,
        trim: true
      }
    }, { _id: false });

    const incidentSchema = new Schema<IIncidentDocument>({
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },
      status: {
        type: String,
        enum: ['investigating', 'identified', 'monitoring', 'resolved'],
        default: 'investigating',
        required: true
      },
      impact: {
        type: String,
        enum: ['minor', 'major', 'critical'],
        default: 'minor',
        required: true
      },
      affectedServices: [{
        type: String,
        trim: true
      }],
      updates: [incidentUpdateSchema],
      createdAt: {
        type: Date,
        default: Date.now,
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now,
        required: true
      },
      resolvedAt: {
        type: Date
      }
    });

    // Indexes
    incidentSchema.index({ status: 1, createdAt: -1 });
    incidentSchema.index({ impact: 1, createdAt: -1 });
    incidentSchema.index({ createdAt: -1 });

    // Instance methods
    incidentSchema.methods.addUpdate = async function(
      message: string, 
      status: 'investigating' | 'identified' | 'monitoring' | 'resolved',
      author?: string
    ): Promise<void> {
      this.updates.push({
        timestamp: new Date(),
        message,
        status,
        author
      });
      this.status = status;
      this.updatedAt = new Date();
      
      if (status === 'resolved') {
        this.resolvedAt = new Date();
      }
      
      await this.save();
    };

    incidentSchema.methods.resolve = async function(): Promise<void> {
      this.status = 'resolved';
      this.resolvedAt = new Date();
      this.updatedAt = new Date();
      await this.save();
    };

    incidentSchema.methods.isResolved = function(): boolean {
      return this.status === 'resolved';
    };

    incidentSchema.methods.getDuration = function(): number {
      const endTime = this.resolvedAt || new Date();
      return Math.floor((endTime.getTime() - this.createdAt.getTime()) / (1000 * 60)); // minutes
    };

    // Static methods
    incidentSchema.statics.createIncident = async function(incidentData: Partial<IIncident>): Promise<IIncidentDocument> {
      const incident = new this(incidentData);
      return await incident.save();
    };

    incidentSchema.statics.getActiveIncidents = async function(): Promise<IIncidentDocument[]> {
      return await this.find({ status: { $ne: 'resolved' } })
        .sort({ createdAt: -1 })
        .exec();
    };

    incidentSchema.statics.getRecentIncidents = async function(limit: number = 10): Promise<IIncidentDocument[]> {
      return await this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    };

    incidentSchema.statics.getIncidentsByStatus = async function(status: string): Promise<IIncidentDocument[]> {
      return await this.find({ status })
        .sort({ createdAt: -1 })
        .exec();
    };

    // Pre-save middleware
    incidentSchema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });

    return mongoose.model<IIncidentDocument, IIncidentModel>('Incident', incidentSchema);
  }
}

export default IncidentModel.getInstance();
