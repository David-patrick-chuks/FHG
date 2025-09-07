import { Router } from 'express';
import { IncidentController } from '../controllers/IncidentController';

export class IncidentRoutes {
  public static getBasePath(): string {
    return '/api/incidents';
  }

  public static getRouter(): Router {
    const router = Router();

    /**
     * @route GET /api/incidents
     * @desc Get all incidents
     * @access Public
     */
    router.get('/', IncidentController.getAllIncidents);

    /**
     * @route GET /api/incidents/active
     * @desc Get active incidents
     * @access Public
     */
    router.get('/active', IncidentController.getActiveIncidents);

    /**
     * @route GET /api/incidents/:id
     * @desc Get incident by ID
     * @access Public
     */
    router.get('/:id', IncidentController.getIncidentById);

    /**
     * @route POST /api/incidents
     * @desc Create a new incident
     * @access Public (in production, this should be admin-only)
     */
    router.post('/', IncidentController.createIncident);

    /**
     * @route PATCH /api/incidents/:id
     * @desc Update incident
     * @access Public (in production, this should be admin-only)
     */
    router.patch('/:id', IncidentController.updateIncident);

    /**
     * @route POST /api/incidents/:id/resolve
     * @desc Resolve incident
     * @access Public (in production, this should be admin-only)
     */
    router.post('/:id/resolve', IncidentController.resolveIncident);

    /**
     * @route POST /api/incidents/dev/sample
     * @desc Create sample incidents (development only)
     * @access Public (development only)
     */
    router.post('/dev/sample', IncidentController.createSampleIncidents);

    return router;
  }
}
