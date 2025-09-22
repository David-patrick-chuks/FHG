import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class ContactRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    /**
     * @route POST /contact
     * @desc Submit contact form
     * @access Public (no authentication required)
     */
    router.post('/', ContactController.submitContactForm);

    return router;
  }

  public static getBasePath(): string {
    return '/contact';
  }
}
