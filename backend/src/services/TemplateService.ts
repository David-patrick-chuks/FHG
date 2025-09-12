import TemplateModel from '../models/Template';
import UserModel from '../models/User';
import {
  ApiResponse,
  ApproveTemplateRequest,
  CreateTemplateRequest,
  ReviewTemplateRequest,
  TemplateCategory,
  TemplateStatus,
  UpdateTemplateRequest
} from '../types';
import { Logger } from '../utils/Logger';

export class TemplateService {
  private static logger: Logger = new Logger();

  /**
   * Helper function to serialize template document to JSON
   */
  private static serializeTemplate(template: any): any {
    const templateObj = template.toObject();
    return {
      _id: templateObj._id.toString(),
      userId: templateObj.userId.toString(),
      name: templateObj.name,
      description: templateObj.description,
      category: templateObj.category,
      industry: templateObj.industry,
      targetAudience: templateObj.targetAudience,
      status: templateObj.status,
      isPublic: templateObj.isPublic,
      isApproved: templateObj.isApproved,
      approvedBy: templateObj.approvedBy?.toString(),
      approvedAt: templateObj.approvedAt?.toISOString(),
      rejectionReason: templateObj.rejectionReason,
      samples: templateObj.samples.map((sample: any) => ({
        _id: sample._id.toString(),
        title: sample.title,
        content: sample.content,
        useCase: sample.useCase,
        variables: sample.variables,
        createdAt: sample.createdAt?.toISOString()
      })),
      tags: templateObj.tags,
      usageCount: templateObj.usageCount,
      rating: templateObj.rating,
      reviews: templateObj.reviews.map((review: any) => ({
        _id: review._id.toString(),
        userId: review.userId.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt?.toISOString()
      })),
      featured: templateObj.featured,
      featuredAt: templateObj.featuredAt?.toISOString(),
      createdAt: templateObj.createdAt?.toISOString(),
      updatedAt: templateObj.updatedAt?.toISOString()
    };
  }

  public static async createTemplate(userId: string, templateData: CreateTemplateRequest): Promise<ApiResponse<any>> {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Validate minimum samples requirement
      if (templateData.samples.length < 10) {
        return {
          success: false,
          message: 'Template must have at least 10 samples',
          timestamp: new Date()
        };
      }

      // Validate maximum samples limit
      if (templateData.samples.length > 20) {
        return {
          success: false,
          message: 'Template cannot have more than 20 samples',
          timestamp: new Date()
        };
      }

      // Create template
      const template = new TemplateModel({
        ...templateData,
        userId,
        status: templateData.isPublic ? TemplateStatus.PENDING_APPROVAL : TemplateStatus.DRAFT
      });

      await template.save();

      TemplateService.logger.info('Template created successfully', {
        templateId: template._id,
        userId,
        templateName: template.name,
        sampleCount: template.samples.length,
        isPublic: template.isPublic
      });

      return {
        success: true,
        message: 'Template created successfully',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error creating template:', error);
      throw error;
    }
  }

  public static async getTemplatesByUserId(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const templates = await TemplateModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Templates retrieved successfully',
        data: templates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving user templates:', error);
      throw error;
    }
  }

  public static async getPublishedTemplates(params?: {
    category?: TemplateCategory;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      let query: any = {
        isPublic: true,
        isApproved: true,
        status: TemplateStatus.APPROVED
      };

      if (params?.category) {
        query.category = params.category;
      }

      let templates;
      if (params?.search) {
        templates = await TemplateModel.findTemplatesBySearch(params.search);
      } else {
        templates = await TemplateModel.findPublishedTemplates();
      }

      // Apply pagination
      if (params?.limit || params?.offset) {
        const limit = params.limit || 10;
        const offset = params.offset || 0;
        templates = templates.slice(offset, offset + limit);
      }

      return {
        success: true,
        message: 'Published templates retrieved successfully',
        data: templates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving published templates:', error);
      throw error;
    }
  }

  public static async getTemplateById(templateId: string, userId?: string): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      // Check if user can access this template
      if (template.isPublic && template.isApproved) {
        // Public template, anyone can access
      } else if (userId && template.userId.toString() === userId) {
        // User's own template
      } else {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Template retrieved successfully',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving template:', error);
      throw error;
    }
  }

  public static async updateTemplate(templateId: string, userId: string, updateData: UpdateTemplateRequest): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      // Check if user owns this template
      if (template.userId.toString() !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if template can be updated
      if (template.status === TemplateStatus.APPROVED && template.isPublic) {
        return {
          success: false,
          message: 'Cannot update approved public template',
          timestamp: new Date()
        };
      }

      // Validate samples if provided
      if (updateData.samples) {
        if (updateData.samples.length < 10) {
          return {
            success: false,
            message: 'Template must have at least 10 samples',
            timestamp: new Date()
          };
        }
        if (updateData.samples.length > 20) {
          return {
            success: false,
            message: 'Template cannot have more than 20 samples',
            timestamp: new Date()
          };
        }
      }

      // Update template
      Object.assign(template, updateData);
      
      // If making public, set status to pending approval
      if (updateData.isPublic && !template.isPublic) {
        template.status = TemplateStatus.PENDING_APPROVAL;
      }

      await template.save();

      TemplateService.logger.info('Template updated successfully', {
        templateId: template._id,
        userId,
        templateName: template.name
      });

      return {
        success: true,
        message: 'Template updated successfully',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error updating template:', error);
      throw error;
    }
  }

  public static async deleteTemplate(templateId: string, userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      // Check if user owns this template
      if (template.userId.toString() !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if template can be deleted
      if (template.status === TemplateStatus.APPROVED && template.isPublic && template.usageCount > 0) {
        return {
          success: false,
          message: 'Cannot delete approved public template with usage',
          timestamp: new Date()
        };
      }

      await TemplateModel.findByIdAndDelete(templateId);

      TemplateService.logger.info('Template deleted successfully', {
        templateId,
        userId,
        templateName: template.name
      });

      return {
        success: true,
        message: 'Template deleted successfully',
        data: { message: 'Template deleted successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error deleting template:', error);
      throw error;
    }
  }

  public static async approveTemplate(templateId: string, adminUserId: string, approvalData: ApproveTemplateRequest): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      if (template.status !== TemplateStatus.PENDING_APPROVAL) {
        return {
          success: false,
          message: 'Template is not pending approval',
          timestamp: new Date()
        };
      }

      if (approvalData.approved) {
        await template.approveTemplate();
        template.approvedBy = adminUserId;
        await template.save();
      } else {
        await template.rejectTemplate(approvalData.rejectionReason || 'No reason provided');
      }

      TemplateService.logger.info('Template approval processed', {
        templateId: template._id,
        adminUserId,
        approved: approvalData.approved,
        templateName: template.name
      });

      return {
        success: true,
        message: approvalData.approved ? 'Template approved successfully' : 'Template rejected successfully',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error processing template approval:', error);
      throw error;
    }
  }

  public static async reviewTemplate(templateId: string, userId: string, reviewData: ReviewTemplateRequest): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      if (!template.isPublic || !template.isApproved) {
        return {
          success: false,
          message: 'Cannot review unpublished template',
          timestamp: new Date()
        };
      }

      // Check if user already reviewed this template
      const existingReview = template.reviews.find(review => review.userId.toString() === userId);
      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this template',
          timestamp: new Date()
        };
      }

      // Add review
      template.reviews.push({
        _id: new Date().getTime().toString(), // Generate a temporary ID
        userId,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        createdAt: new Date()
      });

      // Update rating average
      const totalRating = template.reviews.reduce((sum, review) => sum + review.rating, 0);
      template.rating.average = totalRating / template.reviews.length;
      template.rating.count = template.reviews.length;

      await template.save();

      TemplateService.logger.info('Template review added', {
        templateId: template._id,
        userId,
        rating: reviewData.rating,
        templateName: template.name
      });

      return {
        success: true,
        message: 'Review added successfully',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error adding template review:', error);
      throw error;
    }
  }

  public static async useTemplate(templateId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      if (!template.isPublic || !template.isApproved) {
        return {
          success: false,
          message: 'Template is not available for use',
          timestamp: new Date()
        };
      }

      // Check if user already has this template
      const existingTemplate = await TemplateModel.findOne({
        userId,
        originalTemplateId: templateId
      });

      if (existingTemplate) {
        return {
          success: false,
          message: 'You already have this template in your collection',
          timestamp: new Date()
        };
      }

      // Create a copy of the template for the user
      const userTemplate = new TemplateModel({
        userId,
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        targetAudience: template.targetAudience,
        isPublic: false, // User's copy is private by default
        isApproved: true, // User's copy is auto-approved
        status: TemplateStatus.APPROVED,
        samples: template.samples,
        tags: template.tags,
        originalTemplateId: templateId, // Reference to the original template
        usageCount: 0 // Reset usage count for user's copy
      });

      await userTemplate.save();

      // Increment usage count of the original template
      await template.incrementUsageCount();

      TemplateService.logger.info('Template added to user collection', {
        originalTemplateId: template._id,
        userTemplateId: userTemplate._id,
        userId,
        templateName: template.name
      });

      return {
        success: true,
        message: 'Template added to your collection successfully',
        data: TemplateService.serializeTemplate(userTemplate),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error using template:', error);
      throw error;
    }
  }

  public static async getPendingApprovals(): Promise<ApiResponse<any[]>> {
    try {
      const templates = await TemplateModel.findTemplatesByStatus(TemplateStatus.PENDING_APPROVAL);
      
      return {
        success: true,
        message: 'Pending approvals retrieved successfully',
        data: templates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving pending approvals:', error);
      throw error;
    }
  }

  public static async getPopularTemplates(limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const templates = await TemplateModel.findPopularTemplates(limit);
      
      return {
        success: true,
        message: 'Popular templates retrieved successfully',
        data: templates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving popular templates:', error);
      throw error;
    }
  }
}
