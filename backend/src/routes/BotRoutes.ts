import { Router } from 'express';
import { BotController } from '../controllers/BotController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class BotRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // All bot routes require authentication
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.requireAuth);
    this.router.use(AuthMiddleware.rateLimitByUser);

    // Bot management
    this.router.post('/', 
      AuthMiddleware.validateSubscriptionLimits('bots'),
      ValidationMiddleware.validateCreateBot,
      BotController.createBot
    );

    this.router.get('/', 
      ValidationMiddleware.validatePagination,
      BotController.getBots
    );

    this.router.get('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBot
    );

    this.router.put('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.updateBot
    );

    this.router.delete('/:id', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.deleteBot
    );

    // Bot status management
    this.router.post('/:id/toggle', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.toggleBotStatus
    );

    this.router.post('/:id/test-smtp', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.testBotConnection
    );

    // Bot statistics
    this.router.get('/:id/stats', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBotStats
    );

    this.router.get('/:id/email-stats', 
      AuthMiddleware.validateOwnership('bot', 'id'),
      BotController.getBotEmailStats
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/bots';
  }
}
