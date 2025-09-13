// Template Types

export enum TemplateStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum TemplateCategory {
  SALES = 'sales',
  MARKETING = 'marketing',
  FOLLOW_UP = 'follow_up',
  COLD_OUTREACH = 'cold_outreach',
  NETWORKING = 'networking',
  PARTNERSHIP = 'partnership',
  CUSTOMER_SUCCESS = 'customer_success',
  RECRUITMENT = 'recruitment',
  EVENT_INVITATION = 'event_invitation',
  THANK_YOU = 'thank_you',
  APOLOGY = 'apology',
  REMINDER = 'reminder',
  INTRODUCTION = 'introduction',
  PROPOSAL = 'proposal',
  FEEDBACK_REQUEST = 'feedback_request',
  OTHER = 'other'
}

export interface ITemplateVariable {
  key: string;
  value: string;
  required: boolean;
}

export interface ITemplateReview {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ITemplate {
  _id: string;
  userId: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  status: TemplateStatus;
  isPublic: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  subject: string;
  body: string;
  useCase: string;
  variables: ITemplateVariable[];
  tags: string[];
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  reviews: ITemplateReview[];
  samples: ITemplateSample[];
  featured: boolean;
  featuredAt?: Date;
  originalTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic: boolean;
  subject: string;
  body: string;
  useCase: string;
  variables: ITemplateVariable[];
  tags: string[];
  samples: ITemplateSample[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic?: boolean;
  subject?: string;
  body?: string;
  useCase?: string;
  variables?: ITemplateVariable[];
  tags?: string[];
  samples?: ITemplateSample[];
}

export interface ApproveTemplateRequest {
  approved: boolean;
  rejectionReason?: string;
}

export interface ReviewTemplateRequest {
  rating: number;
  comment?: string;
}
