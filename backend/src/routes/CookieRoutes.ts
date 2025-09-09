import { Router } from 'express';
import { CookieController } from '../controllers/CookieController';
import { CookieMiddleware } from '../middleware/CookieMiddleware';

export class CookieRoutes {
  public static getBasePath(): string {
    return '/cookies';
  }

  public static getRouter(): Router {
    const router = Router();

    // Apply cookie parsing middleware to all routes
    router.use(CookieMiddleware.parseCookies);

    /**
     * @route POST /api/cookies/consent
     * @desc Set cookie consent preferences
     * @access Public
     */
    router.post('/consent', CookieController.setCookieConsent);

    /**
     * @route GET /api/cookies/consent
     * @desc Get current cookie consent status
     * @access Public
     */
    router.get('/consent', CookieController.getCookieConsent);

    /**
     * @route DELETE /api/cookies/consent
     * @desc Clear all cookie consent data
     * @access Public
     */
    router.delete('/consent', CookieController.clearCookieConsent);

    /**
     * @route PATCH /api/cookies/preference
     * @desc Update specific cookie preference
     * @access Public
     */
    router.patch('/preference', CookieController.updateCookiePreference);

    return router;
  }
}


