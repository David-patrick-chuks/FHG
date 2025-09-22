import IncidentModel from '../models/Incident';
import { ApiResponse, CreateIncidentData, IIncident, UpdateIncidentData } from '../types';
import { Logger } from '../utils/Logger';
import { SystemActivityLogger } from './SystemActivityLogger';

export class IncidentService {
  private static logger: Logger = new Logger();
  private static incidentCreationCache = new Map<string, number>(); // Cache for rate limiting

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

      // Log incident creation as system activity
      await SystemActivityLogger.logSystemEvent(
        'SYSTEM_ERROR' as any,
        'Incident Created',
        `New incident created: ${incident.title}`,
        incident.impact === 'critical' ? 'critical' : incident.impact === 'major' ? 'high' : 'medium',
        'incident_management',
        {
          incidentId: incident._id,
          title: incident.title,
          impact: incident.impact,
          affectedServices: incident.affectedServices,
          status: incident.status
        }
      );

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

      // Log incident update as system activity
      await SystemActivityLogger.logSystemEvent(
        'SYSTEM_MAINTENANCE' as any,
        'Incident Updated',
        `Incident updated: ${incident.title} - Status: ${updateData.status}`,
        'medium',
        'incident_management',
        {
          incidentId: incident._id,
          title: incident.title,
          status: updateData.status,
          author: updateData.author,
          message: updateData.message
        }
      );

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

      // Log incident resolution as system activity
      await SystemActivityLogger.logSystemEvent(
        'SYSTEM_MAINTENANCE' as any,
        'Incident Resolved',
        `Incident resolved: ${incident.title}`,
        'low',
        'incident_management',
        {
          incidentId: incident._id,
          title: incident.title,
          duration: incident.getDuration(),
          author: author,
          impact: incident.impact,
          affectedServices: incident.affectedServices
        }
      );

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

  /**
   * Create incident from critical system activity
   */
  public static async createIncidentFromSystemActivity(
    systemActivity: {
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      source: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<IIncident>> {
    try {
      // Only create incidents for high/critical severity events
      if (systemActivity.severity !== 'high' && systemActivity.severity !== 'critical') {
        return {
          success: false,
          message: 'Only high or critical severity events can create incidents',
          timestamp: new Date()
        };
      }

      // Rate limiting check - prevent rapid successive incident creation
      const rateLimitKey = `${systemActivity.source}:${systemActivity.title}`;
      const now = Date.now();
      const lastCreation = IncidentService.incidentCreationCache.get(rateLimitKey);
      
      if (lastCreation && (now - lastCreation) < 300000) { // 5 minutes rate limit
        IncidentService.logger.info('Incident creation rate limited', {
          source: systemActivity.source,
          title: systemActivity.title,
          timeSinceLastCreation: now - lastCreation
        });
        
        return {
          success: false,
          message: 'Incident creation rate limited - please wait before creating similar incidents',
          timestamp: new Date()
        };
      }

      // Enhanced duplicate prevention with multiple checks
      const duplicateCheck = await this.checkForDuplicateIncident(systemActivity);
      if (duplicateCheck.isDuplicate) {
        IncidentService.logger.info('Duplicate incident prevented', {
          existingIncidentId: duplicateCheck.existingIncident?._id,
          newTitle: systemActivity.title,
          source: systemActivity.source
        });
        
        return {
          success: false,
          message: 'Similar incident already exists',
          data: duplicateCheck.existingIncident?.toObject() as IIncident,
          timestamp: new Date()
        };
      }

      // Map severity to impact
      const impact = systemActivity.severity === 'critical' ? 'critical' : 'major';

      // Determine affected services based on source
      const affectedServices = this.getAffectedServicesFromSource(systemActivity.source);

      const incidentData: CreateIncidentData = {
        title: systemActivity.title,
        description: systemActivity.description,
        impact: impact,
        affectedServices: affectedServices,
        initialMessage: `Incident automatically created from system activity: ${systemActivity.description}`
      };

      const result = await IncidentService.createIncident(incidentData);
      
      // Update rate limit cache on successful creation
      if (result.success) {
        IncidentService.incidentCreationCache.set(rateLimitKey, now);
        
        // Clean up old cache entries (older than 1 hour)
        const oneHourAgo = now - 3600000;
        for (const [key, timestamp] of IncidentService.incidentCreationCache.entries()) {
          if (timestamp < oneHourAgo) {
            IncidentService.incidentCreationCache.delete(key);
          }
        }
      }
      
      return result;
    } catch (error) {
      IncidentService.logger.error('Error creating incident from system activity:', error);
      return {
        success: false,
        message: 'Failed to create incident from system activity',
        timestamp: new Date()
      };
    }
  }

  /**
   * Enhanced duplicate detection for incidents
   */
  private static async checkForDuplicateIncident(systemActivity: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    metadata?: Record<string, any>;
  }): Promise<{ isDuplicate: boolean; existingIncident?: any }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

    // Check 1: Exact title match with active status (within 1 hour)
    let existingIncident = await IncidentModel.findOne({
      title: systemActivity.title,
      status: { $in: ['investigating', 'identified', 'monitoring'] },
      createdAt: { $gte: oneHourAgo }
    });

    if (existingIncident) {
      return { isDuplicate: true, existingIncident };
    }

    // Check 2: Similar title pattern (for dynamic error messages)
    // Extract key words from title for pattern matching
    const titleWords = systemActivity.title.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .split(/\s+/)
      .filter(word => word.length > 3); // Only words longer than 3 characters

    if (titleWords.length > 0) {
      const titlePattern = titleWords.join(' ');
      existingIncident = await IncidentModel.findOne({
        $and: [
          { status: { $in: ['investigating', 'identified', 'monitoring'] } },
          { createdAt: { $gte: oneHourAgo } },
          {
            $or: [
              { title: { $regex: titlePattern, $options: 'i' } },
              { description: { $regex: titlePattern, $options: 'i' } }
            ]
          }
        ]
      });

      if (existingIncident) {
        return { isDuplicate: true, existingIncident };
      }
    }

    // Check 3: Same source and similar error type (within 1 day)
    if (systemActivity.metadata?.errorName) {
      existingIncident = await IncidentModel.findOne({
        $and: [
          { status: { $in: ['investigating', 'identified', 'monitoring'] } },
          { createdAt: { $gte: oneDayAgo } },
          { description: { $regex: systemActivity.metadata.errorName, $options: 'i' } }
        ]
      });

      if (existingIncident) {
        return { isDuplicate: true, existingIncident };
      }
    }

    // Check 4: Same endpoint/URL pattern (for API errors)
    if (systemActivity.metadata?.endpoint) {
      const endpoint = systemActivity.metadata.endpoint;
      existingIncident = await IncidentModel.findOne({
        $and: [
          { status: { $in: ['investigating', 'identified', 'monitoring'] } },
          { createdAt: { $gte: oneHourAgo } },
          { description: { $regex: endpoint, $options: 'i' } }
        ]
      });

      if (existingIncident) {
        return { isDuplicate: true, existingIncident };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Helper method to determine affected services from source
   */
  private static getAffectedServicesFromSource(source: string): string[] {
    const serviceMap: Record<string, string[]> = {
      'database': ['Database', 'Data Storage'],
      'api': ['API Service', 'REST Endpoints'],
      'auth': ['Authentication Service', 'User Management'],
      'email': ['Email Service', 'SMTP'],
      'security': ['Security Service', 'Access Control'],
      'performance': ['Performance Monitoring', 'Resource Management'],
      'server': ['Application Server', 'Web Server'],
      'incident_management': ['Incident Management System']
    };

    return serviceMap[source] || ['System Services'];
  }
}
