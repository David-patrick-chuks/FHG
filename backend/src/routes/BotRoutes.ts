import { Router } from 'express';
import { BotController } from '../controllers/BotController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class BotRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All bot routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    // Bot management
    router.post('/', 
      AuthMiddleware.validateSubscriptionLimits('bots'),
      ValidationMiddleware.validateCreateBot,
      BotController.createBot
    );

    router.get('/', 
      ValidationMiddleware.validatePagination,
      BotController.getBots
    );

    router.get('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBot
    );

    router.put('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.updateBot
    );

    router.delete('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.deleteBot
    );

    // Bot status management
    router.post('/:id/toggle', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.toggleBotStatus
    );

    router.post('/:id/test-smtp', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.testBotConnection
    );

    // Bot statistics
    router.get('/:id/stats', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBotStats
    );

    router.get('/:id/email-stats', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBotEmailStats
    );

    return router;
  }

  public static getBasePath(): string {
    return '/bots';
  }
}
