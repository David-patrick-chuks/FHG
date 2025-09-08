'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStatus } from '@/lib/api/system-status';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface OverallStatusProps {
  systemStatus: SystemStatus | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function OverallStatus({ systemStatus, lastUpdated, isLoading, error, onRefresh }: OverallStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'healthy':
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'down':
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'warning':
      case 'degraded':
        return <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
      case 'down':
      case 'critical':
        return <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Overall System Status</CardTitle>
              <CardDescription>
                {lastUpdated && `Last updated: ${lastUpdated.toLocaleString()}`}
              </CardDescription>
            </div>
            {systemStatus && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.status)}
                <span className={`text-lg font-semibold ${getStatusColor(systemStatus.status)}`}>
                  {systemStatus.status}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400">{error}</div>
              <button 
                onClick={onRefresh}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : systemStatus ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatUptime(systemStatus.uptime.process)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Process Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.application.responseTime}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.application.activeConnections}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Connections</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
