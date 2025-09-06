import { Router } from 'express';
import multer from 'multer';
import { EmailExtractorController } from '../controllers/EmailExtractorController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class EmailExtractorRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Configure multer for CSV file uploads
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All email extractor routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    /**
     * @route POST /start
     * @desc Start email extraction from URLs
     * @access Private
     */
    router.post('/start', EmailExtractorController.startExtraction);

    /**
     * @route GET /extractions
     * @desc Get user's extraction history
     * @access Private
     */
    router.get('/extractions', 
      ValidationMiddleware.validatePagination,
      EmailExtractorController.getExtractions
    );

    /**
     * @route GET /extraction/:jobId
     * @desc Get specific extraction by job ID
     * @access Private
     */
    router.get('/extraction/:jobId', EmailExtractorController.getExtraction);

    /**
     * @route GET /download/:jobId
     * @desc Download extraction results as CSV
     * @access Private
     */
    router.get('/download/:jobId', EmailExtractorController.downloadResults);

    /**
     * @route POST /parse-csv
     * @desc Parse CSV file and extract URLs
     * @access Private
     */
    router.post('/parse-csv', upload.single('csvFile'), EmailExtractorController.parseCsvFile);

    /**
     * @route GET /subscription-info
     * @desc Get subscription limits and usage info
     * @access Private
     */
    router.get('/subscription-info', EmailExtractorController.getSubscriptionInfo);

    /**
     * @route POST /log-viewed/:jobId
     * @desc Log results viewed activity
     * @access Private
     */
    router.post('/log-viewed/:jobId', EmailExtractorController.logResultsViewed);

    return router;
  }

  public static getBasePath(): string {
    return '/email-extractor';
  }
}
