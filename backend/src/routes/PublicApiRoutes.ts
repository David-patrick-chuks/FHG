import { Router } from 'express';
import { PublicApiController } from '../controllers/PublicApiController';
import { ApiKeyMiddleware } from '../middleware/ApiKeyMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class PublicApiRoutes {
  public static getBasePath(): string {
    return '/api/v1';
  }

  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // API key authentication for all public API routes
    router.use(ApiKeyMiddleware.authenticateApiKey);
    router.use(ApiKeyMiddleware.rateLimitByApiKey);

    /**
     * @route POST /api/v1/extract
     * @desc Start email extraction from URLs
     * @access Public (API Key Required)
     * @body { urls: string[], extractionType?: 'single' | 'multiple' }
     */
    router.post('/extract', PublicApiController.startExtraction);

    /**
     * @route GET /api/v1/extract/:jobId
     * @desc Get extraction status and results
     * @access Public (API Key Required)
     */
    router.get('/extract/:jobId', PublicApiController.getExtraction);

    /**
     * @route GET /api/v1/extract/:jobId/download
     * @desc Download extraction results as CSV
     * @access Public (API Key Required)
     */
    router.get('/extract/:jobId/download', PublicApiController.downloadResults);

    /**
     * @route GET /api/v1/usage
     * @desc Get API usage and limits
     * @access Public (API Key Required)
     */
    router.get('/usage', PublicApiController.getApiUsage);

    /**
     * @route GET /api/v1/limits
     * @desc Get API limits and plan details
     * @access Public (API Key Required)
     */
    router.get('/limits', PublicApiController.getApiUsage);

    return router;
  }
}
