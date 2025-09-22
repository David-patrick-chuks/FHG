// Incident Management Types

export interface IIncident {
  _id?: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  updates: IIncidentUpdate[];
}

export interface IIncidentUpdate {
  timestamp: Date;
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
