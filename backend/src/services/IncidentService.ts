import IncidentModel from '../models/Incident';
import { ApiResponse, CreateIncidentData, IIncident, UpdateIncidentData } from '../types';
import { Logger } from '../utils/Logger';

export class IncidentService {
  private static logger: Logger = new Logger();

  /**
   * Create a new incident
   */
  public static async createIncident(incidentData: CreateIncidentData): Promise<ApiResponse<IIncident>> {
    try {
      const incident = await IncidentModel.createIncident({
        title: incidentData.title,
        description: incidentData.description,
        impact: incidentData.impact,
        affectedServices: incidentData.affectedServices,
        status: 'investigating',
        updates: []
      });

      // Add initial update if provided
      if (incidentData.initialMessage) {
        await incident.addUpdate(
          incidentData.initialMessage,
          'investigating',
          'System'
        );
      }

      IncidentService.logger.info('Incident created', {
        incidentId: incident._id,
        title: incident.title,
        impact: incident.impact
      });

      return {
        success: true,
        message: 'Incident created successfully',
        data: incident.toObject() as IIncident,
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error creating incident:', error);
      return {
        success: false,
        message: 'Failed to create incident',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get all incidents
   */
  public static async getAllIncidents(): Promise<ApiResponse<IIncident[]>> {
    try {
      const incidents = await IncidentModel.find().sort({ createdAt: -1 }).exec();
      
      return {
        success: true,
        message: 'Incidents retrieved successfully',
        data: incidents.map(incident => incident.toObject() as IIncident),
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error retrieving incidents:', error);
      return {
        success: false,
        message: 'Failed to retrieve incidents',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get active incidents
   */
  public static async getActiveIncidents(): Promise<ApiResponse<IIncident[]>> {
    try {
      const incidents = await IncidentModel.getActiveIncidents();
      
      return {
        success: true,
        message: 'Active incidents retrieved successfully',
        data: incidents.map(incident => incident.toObject() as IIncident),
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error retrieving active incidents:', error);
      return {
        success: false,
        message: 'Failed to retrieve active incidents',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get incident by ID
   */
  public static async getIncidentById(incidentId: string): Promise<ApiResponse<IIncident>> {
    try {
      const incident = await IncidentModel.findById(incidentId);
      
      if (!incident) {
        return {
          success: false,
          message: 'Incident not found',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Incident retrieved successfully',
        data: incident.toObject() as IIncident,
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error retrieving incident:', error);
      return {
        success: false,
        message: 'Failed to retrieve incident',
        timestamp: new Date()
      };
    }
  }

  /**
   * Update incident status
   */
  public static async updateIncident(
    incidentId: string, 
    updateData: UpdateIncidentData
  ): Promise<ApiResponse<IIncident>> {
    try {
      const incident = await IncidentModel.findById(incidentId);
      
      if (!incident) {
        return {
          success: false,
          message: 'Incident not found',
          timestamp: new Date()
        };
      }

      await incident.addUpdate(
        updateData.message,
        updateData.status,
        updateData.author || 'System'
      );

      IncidentService.logger.info('Incident updated', {
        incidentId: incident._id,
        status: updateData.status,
        author: updateData.author
      });

      return {
        success: true,
        message: 'Incident updated successfully',
        data: incident.toObject() as IIncident,
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error updating incident:', error);
      return {
        success: false,
        message: 'Failed to update incident',
        timestamp: new Date()
      };
    }
  }

  /**
   * Resolve incident
   */
  public static async resolveIncident(incidentId: string, author?: string): Promise<ApiResponse<IIncident>> {
    try {
      const incident = await IncidentModel.findById(incidentId);
      
      if (!incident) {
        return {
          success: false,
          message: 'Incident not found',
          timestamp: new Date()
        };
      }

      if (incident.isResolved()) {
        return {
          success: false,
          message: 'Incident is already resolved',
          timestamp: new Date()
        };
      }

      await incident.addUpdate(
        'Incident has been resolved.',
        'resolved',
        author || 'System'
      );

      IncidentService.logger.info('Incident resolved', {
        incidentId: incident._id,
        duration: incident.getDuration(),
        author
      });

      return {
        success: true,
        message: 'Incident resolved successfully',
        data: incident.toObject() as IIncident,
        timestamp: new Date()
      };
    } catch (error) {
      IncidentService.logger.error('Error resolving incident:', error);
      return {
        success: false,
        message: 'Failed to resolve incident',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get incidents for system status
   */
  public static async getIncidentsForSystemStatus(): Promise<IIncident[]> {
    try {
      const incidents = await IncidentModel.getRecentIncidents(5);
      return incidents.map(incident => incident.toObject() as IIncident);
    } catch (error) {
      IncidentService.logger.error('Error retrieving incidents for system status:', error);
      return [];
    }
  }

  /**
   * Create sample incidents for development
   */
  public static async createSampleIncidents(): Promise<void> {
    try {
      // Check if incidents already exist
      const existingIncidents = await IncidentModel.countDocuments();
      if (existingIncidents > 0) {
        return; // Don't create duplicates
      }

      // Create sample incident
      await IncidentService.createIncident({
        title: 'Email delivery delays',
        description: 'Some users experienced delays in email delivery due to high server load.',
        impact: 'minor',
        affectedServices: ['Email Service', 'SMTP'],
        initialMessage: 'We are investigating reports of email delivery delays.'
      });

      // Get the created incident and add updates
      const incidents = await IncidentModel.getRecentIncidents(1);
      if (incidents.length > 0) {
        const incident = incidents[0];
        
        // Add updates with specific timestamps
        const baseTime = new Date('2024-01-15T10:30:00Z');
        
        // Update 1
        incident.updates.push({
          timestamp: new Date(baseTime.getTime() + 45 * 60 * 1000), // +45 minutes
          message: 'We have identified the issue as high server load during peak hours.',
          status: 'identified'
        });
        
        // Update 2
        incident.updates.push({
          timestamp: new Date(baseTime.getTime() + 90 * 60 * 1000), // +90 minutes
          message: 'We have scaled up our infrastructure and are monitoring the situation.',
          status: 'monitoring'
        });
        
        // Update 3 - Resolve
        incident.updates.push({
          timestamp: new Date(baseTime.getTime() + 180 * 60 * 1000), // +180 minutes
          message: 'The issue has been resolved. Email delivery is back to normal.',
          status: 'resolved'
        });
        
        incident.status = 'resolved';
        incident.resolvedAt = new Date(baseTime.getTime() + 180 * 60 * 1000);
        incident.updatedAt = new Date();
        
        await incident.save();
      }

      IncidentService.logger.info('Sample incidents created successfully');
    } catch (error) {
      IncidentService.logger.error('Error creating sample incidents:', error);
    }
  }
}
