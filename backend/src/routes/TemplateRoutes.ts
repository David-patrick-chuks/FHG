import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController';
import { AdminMiddleware } from '../middleware/AdminMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class TemplateRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply authentication middleware to all routes
    router.use(AuthMiddleware.authenticate);

    // Template CRUD operations
    router.post('/', AuthMiddleware.validateSubscriptionLimits('templates'), TemplateController.createTemplate);
    router.get('/my', TemplateController.getMyTemplates);
    router.get('/community', TemplateController.getCommunityTemplates);
    router.get('/popular', TemplateController.getPopularTemplates);
    router.get('/counts', TemplateController.getTemplateCounts);
    router.get('/stats', TemplateController.getTemplateStats);
    router.get('/:id', TemplateController.getTemplate);
    router.put('/:id', TemplateController.updateTemplate);
    router.delete('/:id', TemplateController.deleteTemplate);

    // Template usage and reviews
    router.post('/:id/use', TemplateController.useTemplate);
    router.post('/:id/review', TemplateController.reviewTemplate);

    // Cloning and update management
    router.get('/cloned', TemplateController.getClonedTemplates);
    router.get('/updates', TemplateController.getTemplatesWithUpdates);
    router.post('/:id/mark-update-read', TemplateController.markTemplateUpdateAsRead);

    // Admin-only routes
    router.get('/admin/pending-approvals', AdminMiddleware.requireAdmin, TemplateController.getPendingApprovals);
    router.post('/:id/approve', AdminMiddleware.requireAdmin, TemplateController.approveTemplate);

    return router;
  }

  public static getBasePath(): string {
    return '/templates';
  }
}
