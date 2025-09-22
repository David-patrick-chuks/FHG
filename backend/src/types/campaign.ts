// Campaign and Bot Types

import { CampaignStatus, EmailStatus } from './common';

export interface IBot {
  _id: string;
  userId: string;
  name: string;
  description: string;
  email: string;
  password: string; // encrypted
  isActive: boolean;
  dailyEmailCount: number;
  lastEmailSentAt?: Date;
  profileImage?: string; // RoboHash URL for bot profile image
  createdAt: Date;
  updatedAt: Date;
}

export interface IGeneratedMessage {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  personalizationData?: Record<string, any>;
  isSent: boolean;
  sentAt?: Date;
  createdAt: Date;
}

export interface ICampaign {
  _id: string;
  userId: string;
  botId: string;
  templateId: string; // Required template reference
  name: string;
  description: string;
  status: CampaignStatus;
  emailList: string[];
  generatedMessages?: IGeneratedMessage[];
  selectedMessageIndex: number;
  sentEmails: ISentEmail[];
  totalEmails: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  cancelledAt?: Date;
  scheduledFor?: Date;
  isScheduled: boolean;
  emailInterval: number; // Interval between emails
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
}

export interface ISentEmail {
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  status: EmailStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
  templateSampleId?: string; // Reference to the template sample used
  aiVariation?: number; // Which AI variation was used (1-20)
}

// Request Types
export interface CreateCampaignRequest {
  name: string;
  description: string;
  botId: string;
  templateId: string; // Required template reference
  emailList: string[];
  scheduledFor?: Date;
  isScheduled?: boolean;
  emailInterval: number;
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
}

export interface CreateBotRequest {
  name: string;
  description: string;
  email: string;
  password: string;
  prompt: string;
  profileImage?: string; // Optional custom profile image URL
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  email?: string;
  password?: string;
  prompt?: string;
  isActive?: boolean;
  profileImage?: string; // Optional custom profile image URL
}
