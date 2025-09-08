'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/lib/api/incidents';
import { CheckCircle, Clock } from 'lucide-react';

interface RecentIncidentsProps {
  incidents: Incident[];
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'identified':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Incidents</h2>
      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription className="mt-1">{incident.description}</CardDescription>
                    {incident.affectedServices.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Affected Services: </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {incident.affectedServices.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getIncidentStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                    <Badge className={getImpactColor(incident.impact)}>
                      {incident.impact}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incident.updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {update.status}
                          </Badge>
                          {update.author && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              by {update.author}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Systems Operational
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No recent incidents to report. All services are running smoothly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
