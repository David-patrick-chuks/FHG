'use client';

import { OverallStatus, RecentIncidents, ServiceStatus, SystemMetrics } from '@/components/system-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SystemStatus, SystemStatusAPI } from '@/lib/api';
import { Incident } from '@/lib/api/incidents';
import { Activity, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SystemStatusClient() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get incidents from system status data
  const incidents: Incident[] = systemStatus?.incidents || [];

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching system status...');
      
      // Call the backend API using the proper API client
      const data = await SystemStatusAPI.getSystemStatus();
      
      setSystemStatus(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch system status');
      console.error('Error fetching system status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  System Status
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time system health and performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Status
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemStatus}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <OverallStatus 
          systemStatus={systemStatus}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchSystemStatus}
        />

        <ServiceStatus systemStatus={systemStatus} />

        <SystemMetrics systemStatus={systemStatus} />

        <RecentIncidents incidents={incidents} />
      </main>
    </div>
  );
}
