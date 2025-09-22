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
   * Process template variables in a sample and generate final email content
   */
  public static processTemplateVariables(
    sample: any,
    variableValues: Record<string, string>
  ): { subject: string; body: string } {
    try {
      let processedSubject = sample.subject;
      let processedBody = sample.body;

      // Replace variables in subject and body
      Object.keys(variableValues).forEach((key) => {
        const placeholder = `{{${key}}}`;
        const value = variableValues[key];
        
        // Replace all occurrences of the placeholder
        processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
        processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value);
      });

      return {
        subject: processedSubject,
        body: processedBody
      };
    } catch (error) {
      this.logger.error('Error processing template variables:', error);
      throw new Error('Failed to process template variables');
    }
  }

  /**
   * Validate that all required variables are provided
   */
  public static validateRequiredVariables(
    variables: any[],
    variableValues: Record<string, string>
  ): { isValid: boolean; missingVariables: string[] } {
    const missingVariables: string[] = [];
    
    variables.forEach((variable: any) => {
      if (variable.required && !variableValues[variable.key]) {
        missingVariables.push(variable.key);
      }
    });

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

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
      useCase: templateObj.useCase,
      variables: templateObj.variables.map((variable: any) => ({
        ...variable,
        _id: variable._id?.toString()
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
      samples: (templateObj.samples || []).map((sample: any) => ({
        ...sample,
        _id: sample._id?.toString()
      })), // Include samples array with proper _id serialization
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
      if (templateData.samples.length > 100) {
        return {
          success: false,
          message: 'Template cannot have more than 100 samples',
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

      // Check if this is a cloned template
      if (template.isCloned) {
        return {
          success: false,
          message: 'Cannot update cloned templates. Please edit your own version.',
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

      // If this is a public template being updated, mark it as updated and notify clones
      if (template.isPublic && template.isApproved) {
        await template.markAsUpdated();
        await template.markClonesAsUpdated();
        TemplateService.logger.info('Public template updated, clones marked for update notification', {
          templateId: template._id,
          userId,
          templateName: template.name
        });
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
      // Allow deletion of public templates since clones will remain independent
      if (template.status === TemplateStatus.PENDING_APPROVAL) {
        return {
          success: false,
          message: 'Cannot delete template that is pending approval',
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
      // Validate templateId format
      if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
        TemplateService.logger.error('Invalid template ID provided', { templateId, userId });
        return {
          success: false,
          message: 'Invalid template ID',
          timestamp: new Date()
        };
      }

      // Validate userId format
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        TemplateService.logger.error('Invalid user ID provided', { templateId, userId });
        return {
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date()
        };
      }

      // Validate review data
      if (!reviewData || typeof reviewData !== 'object') {
        TemplateService.logger.error('Invalid review data provided', { templateId, userId, reviewData });
        return {
          success: false,
          message: 'Invalid review data',
          timestamp: new Date()
        };
      }

      if (!reviewData.rating || typeof reviewData.rating !== 'number' || reviewData.rating < 1 || reviewData.rating > 5) {
        TemplateService.logger.error('Invalid rating provided', { templateId, userId, rating: reviewData.rating });
        return {
          success: false,
          message: 'Rating must be a number between 1 and 5',
          timestamp: new Date()
        };
      }

      // Additional validation for comment if provided
      if (reviewData.comment && (typeof reviewData.comment !== 'string' || reviewData.comment.length > 500)) {
        TemplateService.logger.error('Invalid comment provided', { templateId, userId, commentLength: reviewData.comment?.length });
        return {
          success: false,
          message: 'Comment must be a string with maximum 500 characters',
          timestamp: new Date()
        };
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(templateId)) {
        TemplateService.logger.error('Invalid MongoDB ObjectId format', { templateId, userId });
        return {
          success: false,
          message: 'Invalid template ID format',
          timestamp: new Date()
        };
      }

      TemplateService.logger.info('Attempting to find template', { templateId, userId });
      
      // Try to find the template with additional error handling
      let template;
      try {
        template = await TemplateModel.findById(templateId);
      } catch (dbError: any) {
        TemplateService.logger.error('Database error while finding template', { 
          templateId, 
          userId, 
          error: dbError?.message,
          code: dbError?.code 
        });
        return {
          success: false,
          message: 'Database error while finding template',
          timestamp: new Date()
        };
      }
      
      if (!template) {
        TemplateService.logger.error('Template not found', { templateId, userId });
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
      const existingReview = template.reviews.find(review => {
        try {
          return review.userId.toString() === userId;
        } catch (error) {
          // Handle any issues with review data
          console.warn('Invalid review data found:', error);
          return false;
        }
      });
      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this template',
          timestamp: new Date()
        };
      }

      // Add review
      try {
        // Ensure reviews array exists
        if (!template.reviews) {
          template.reviews = [];
        }

        // Create new review object
        const newReview = {
          userId: userId,
          rating: reviewData.rating,
          comment: reviewData.comment || '',
          createdAt: new Date()
        };

        // Add the review
        template.reviews.push(newReview);

        // Update rating average with better error handling
        const totalRating = template.reviews.reduce((sum, review) => {
          try {
            if (review && typeof review.rating === 'number' && !isNaN(review.rating)) {
              return sum + review.rating;
            }
            return sum;
          } catch (error) {
            TemplateService.logger.warn('Invalid review rating found during calculation:', { error, review });
            return sum;
          }
        }, 0);

        // Calculate new average and count
        const reviewCount = template.reviews.length;
        template.rating.average = reviewCount > 0 ? Math.round((totalRating / reviewCount) * 100) / 100 : 0; // Round to 2 decimal places
        template.rating.count = reviewCount;

        TemplateService.logger.info('Saving template with new review', { 
          templateId: template._id, 
          userId, 
          reviewCount: reviewCount,
          newRating: reviewData.rating,
          newAverage: template.rating.average
        });

        // Save with validation
        const savedTemplate = await template.save();
        
        if (!savedTemplate) {
          throw new Error('Failed to save template - no result returned');
        }

        TemplateService.logger.info('Template saved successfully with new review', { 
          templateId: savedTemplate._id, 
          userId, 
          reviewCount: savedTemplate.reviews.length
        });

      } catch (saveError: any) {
        TemplateService.logger.error('Error saving template with review', { 
          templateId: template._id, 
          userId, 
          error: saveError?.message || 'Unknown save error',
          errorName: saveError?.name,
          errorCode: saveError?.code
        });
        
        // Return a more specific error message
        if (saveError?.name === 'ValidationError') {
          return {
            success: false,
            message: 'Validation error: ' + saveError.message,
            timestamp: new Date()
          };
        } else if (saveError?.name === 'CastError') {
          return {
            success: false,
            message: 'Invalid data format in review',
            timestamp: new Date()
          };
        } else {
        throw saveError;
        }
      }

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
    } catch (error: any) {
      TemplateService.logger.error('Error adding template review:', {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        templateId,
        userId,
        reviewData,
        errorName: error?.name,
        errorCode: error?.code
      });
      
      // Return error response instead of throwing
      return {
        success: false,
        message: `Failed to add template review: ${error?.message || 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  public static async useTemplate(templateId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      // Validate templateId format
      if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
        TemplateService.logger.error('Invalid template ID provided', { templateId, userId });
        return {
          success: false,
          message: 'Invalid template ID',
          timestamp: new Date()
        };
      }

      // Validate userId format
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        TemplateService.logger.error('Invalid user ID provided', { templateId, userId });
        return {
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date()
        };
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(templateId)) {
        TemplateService.logger.error('Invalid MongoDB ObjectId format', { templateId, userId });
        return {
          success: false,
          message: 'Invalid template ID format',
          timestamp: new Date()
        };
      }

      TemplateService.logger.info('Attempting to find template', { templateId, userId });
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        TemplateService.logger.error('Template not found', { templateId, userId });
        return {
          success: false,
          message: 'Template not found',
          timestamp: new Date()
        };
      }

      if (!template.isPublic || !template.isApproved) {
        TemplateService.logger.warn('Template not available for use', { 
          templateId, 
          userId, 
          isPublic: template.isPublic, 
          isApproved: template.isApproved 
        });
        return {
          success: false,
          message: 'Template is not available for use',
          timestamp: new Date()
        };
      }

      // Check if user already has a cloned version of this template
      TemplateService.logger.info('Checking for existing cloned template', { templateId, userId });
      const existingClonedTemplate = await TemplateModel.findOne({
        userId,
        clonedFrom: templateId
      });

      if (existingClonedTemplate) {
        TemplateService.logger.info('User already has a cloned version of this template', { 
          templateId, 
          userId, 
          existingClonedTemplateId: existingClonedTemplate._id 
        });
        return {
          success: false,
          message: 'You already have a copy of this template in your collection',
          timestamp: new Date()
        };
      }

      // Clone the template for the user
      TemplateService.logger.info('Cloning template for user', { 
        templateId, 
        userId, 
        templateName: template.name,
        sampleCount: template.samples?.length || 0,
        variableCount: template.variables?.length || 0
      });

      let clonedTemplate;
      try {
        // Use the new cloneTemplate method
        clonedTemplate = await template.cloneTemplate(userId);
        TemplateService.logger.info('Template cloned successfully', { 
          templateId, 
          userId, 
          clonedTemplateId: clonedTemplate._id 
        });

        // Increment usage count of the original template
        try {
          await template.incrementUsageCount();
          TemplateService.logger.info('Original template usage count incremented', { 
            templateId, 
            userId, 
            newUsageCount: template.usageCount 
          });
        } catch (usageError: any) {
          TemplateService.logger.error('Error incrementing usage count', { 
            templateId, 
            userId, 
            error: usageError?.message 
          });
          // Don't fail the entire operation if usage count increment fails
        }
      } catch (saveError: any) {
        TemplateService.logger.error('Error saving user template', { 
          templateId, 
          userId, 
          error: saveError?.message,
          stack: saveError?.stack
        });
        throw saveError;
      }

      TemplateService.logger.info('Template added to user collection', {
        originalTemplateId: template._id,
        userTemplateId: template._id,
        userId,
        templateName: template.name
      });

      return {
        success: true,
        message: 'Template cloned to your collection successfully',
        data: TemplateService.serializeTemplate(clonedTemplate),
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

  public static async getTemplateCounts(userId: string): Promise<ApiResponse<{
    myTemplates: number;
    communityTemplates: number;
    totalUsage: number;
  }>> {
    try {
      // Get user's templates count (including cloned templates)
      const myTemplatesCount = await TemplateModel.countDocuments({ userId });
      
      // Get community templates count (published templates)
      const communityTemplatesCount = await TemplateModel.countDocuments({ 
        isPublic: true, 
        isApproved: true,
        status: 'approved' 
      });
      
      // Get total usage count for user's templates
      const userTemplates = await TemplateModel.find({ userId });
      const totalUsage = userTemplates.reduce((sum, template) => sum + (template.usageCount || 0), 0);
      
      return {
        success: true,
        message: 'Template counts retrieved successfully',
        data: {
          myTemplates: myTemplatesCount,
          communityTemplates: communityTemplatesCount,
          totalUsage
        },
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving template counts:', error);
      throw error;
    }
  }

  public static async getTemplateStats(userId: string): Promise<ApiResponse<{
    myTemplates: number;
    communityTemplates: number;
    totalUserUsage: number;
  }>> {
    try {
      // Get user's templates count (including cloned templates)
      const myTemplatesCount = await TemplateModel.countDocuments({ userId });
      
      // Get community templates count (published templates)
      const communityTemplatesCount = await TemplateModel.countDocuments({ 
        isPublic: true, 
        isApproved: true,
        status: 'approved' 
      });
      
      // Get total times user has used/cloned templates
      const clonedTemplatesCount = await TemplateModel.countDocuments({ 
        userId, 
        isCloned: true 
      });
      
      return {
        success: true,
        message: 'Template stats retrieved successfully',
        data: {
          myTemplates: myTemplatesCount,
          communityTemplates: communityTemplatesCount,
          totalUserUsage: clonedTemplatesCount
        },
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving template stats:', error);
      throw error;
    }
  }

  public static async getClonedTemplates(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const clonedTemplates = await TemplateModel.findClonedTemplates(userId);
      
      return {
        success: true,
        message: 'Cloned templates retrieved successfully',
        data: clonedTemplates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving cloned templates:', error);
      throw error;
    }
  }

  public static async getTemplatesWithUpdates(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const templatesWithUpdates = await TemplateModel.findTemplatesWithUpdates(userId);
      
      return {
        success: true,
        message: 'Templates with updates retrieved successfully',
        data: templatesWithUpdates.map(template => TemplateService.serializeTemplate(template)),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error retrieving templates with updates:', error);
      throw error;
    }
  }

  public static async markTemplateUpdateAsRead(templateId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const template = await TemplateModel.findOne({
        _id: templateId,
        userId,
        isCloned: true
      });

      if (!template) {
        return {
          success: false,
          message: 'Template not found or access denied',
          timestamp: new Date()
        };
      }

      template.hasUpdates = false;
      await template.save();

      return {
        success: true,
        message: 'Template update marked as read',
        data: TemplateService.serializeTemplate(template),
        timestamp: new Date()
      };
    } catch (error) {
      TemplateService.logger.error('Error marking template update as read:', error);
      throw error;
    }
  }
}
