import { Request, Response } from 'express';
import { CreateIncidentData, IncidentService, UpdateIncidentData } from '../services/IncidentService';
import { Logger } from '../utils/Logger';

export class IncidentController {
  private static logger: Logger = new Logger();

  /**
   * Create a new incident
   */
  public static async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, impact, affectedServices, initialMessage } = req.body;

      if (!title || !description || !impact) {
        res.status(400).json({
          success: false,
          message: 'Title, description, and impact are required',
          timestamp: new Date()
        });
        return;
      }

      if (!['minor', 'major', 'critical'].includes(impact)) {
        res.status(400).json({
          success: false,
          message: 'Impact must be minor, major, or critical',
          timestamp: new Date()
        });
        return;
      }

      const incidentData: CreateIncidentData = {
        title: title.trim(),
        description: description.trim(),
        impact,
        affectedServices: Array.isArray(affectedServices) ? affectedServices : [],
        initialMessage: initialMessage?.trim()
      };

      const result = await IncidentService.createIncident(incidentData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in createIncident controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get all incidents
   */
  public static async getAllIncidents(req: Request, res: Response): Promise<void> {
    try {
      const result = await IncidentService.getAllIncidents();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in getAllIncidents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get active incidents
   */
  public static async getActiveIncidents(req: Request, res: Response): Promise<void> {
    try {
      const result = await IncidentService.getActiveIncidents();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in getActiveIncidents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get incident by ID
   */
  public static async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await IncidentService.getIncidentById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in getIncidentById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Update incident
   */
  public static async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { message, status, author } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      if (!message || !status) {
        res.status(400).json({
          success: false,
          message: 'Message and status are required',
          timestamp: new Date()
        });
        return;
      }

      if (!['investigating', 'identified', 'monitoring', 'resolved'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be investigating, identified, monitoring, or resolved',
          timestamp: new Date()
        });
        return;
      }

      const updateData: UpdateIncidentData = {
        message: message.trim(),
        status,
        author: author?.trim()
      };

      const result = await IncidentService.updateIncident(id, updateData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in updateIncident controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Resolve incident
   */
  public static async resolveIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { author } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await IncidentService.resolveIncident(id, author?.trim());

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      IncidentController.logger.error('Error in resolveIncident controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Create sample incidents (development only)
   */
  public static async createSampleIncidents(req: Request, res: Response): Promise<void> {
    try {
      if (process.env.NODE_ENV !== 'development') {
        res.status(403).json({
          success: false,
          message: 'This endpoint is only available in development',
          timestamp: new Date()
        });
        return;
      }

      await IncidentService.createSampleIncidents();

      res.status(200).json({
        success: true,
        message: 'Sample incidents created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      IncidentController.logger.error('Error in createSampleIncidents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
