import { apiClient } from '../api-client';

export interface Incident {
  _id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  updates: IncidentUpdate[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IncidentUpdate {
  timestamp: string;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  author?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  initialMessage?: string;
}

export interface UpdateIncidentData {
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  author?: string;
}

export class IncidentAPI {
  /**
   * Get all incidents
   */
  static async getAllIncidents(): Promise<Incident[]> {
    const response = await apiClient.get('/incidents');
    return response.data;
  }

  /**
   * Get active incidents
   */
  static async getActiveIncidents(): Promise<Incident[]> {
    const response = await apiClient.get('/incidents/active');
    return response.data;
  }

  /**
   * Get incident by ID
   */
  static async getIncidentById(id: string): Promise<Incident> {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  }

  /**
   * Create a new incident
   */
  static async createIncident(data: CreateIncidentData): Promise<Incident> {
    const response = await apiClient.post('/incidents', data);
    return response.data;
  }

  /**
   * Update incident
   */
  static async updateIncident(id: string, data: UpdateIncidentData): Promise<Incident> {
    const response = await apiClient.patch(`/incidents/${id}`, data);
    return response.data;
  }

  /**
   * Resolve incident
   */
  static async resolveIncident(id: string, author?: string): Promise<Incident> {
    const response = await apiClient.post(`/incidents/${id}/resolve`, { author });
    return response.data;
  }

  /**
   * Create sample incidents (development only)
   */
  static async createSampleIncidents(): Promise<void> {
    await apiClient.post('/incidents/dev/sample');
  }
}
