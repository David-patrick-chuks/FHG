// Queue and Job Types

import { QueueJobStatus } from './common';

export interface IQueueJob {
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  message: string;
  priority: number;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor: Date;
  processedAt?: Date;
  errorMessage?: string;
}
