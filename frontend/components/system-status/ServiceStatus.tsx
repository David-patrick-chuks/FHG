'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStatus } from '@/lib/api/system-status';
import { CheckCircle, AlertCircle, XCircle, Activity, Database, Globe, Wifi } from 'lucide-react';

interface ServiceStatusProps {
  systemStatus: SystemStatus | null;
}

export function ServiceStatus({ systemStatus }: ServiceStatusProps) {
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
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
      case 'down':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (!systemStatus) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Service Status</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* API Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">API Services</CardTitle>
                <CardDescription>REST API endpoints</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.apiServices?.status || 'operational')}
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.apiServices?.status || 'operational')}`}>
                  {systemStatus.apiServices?.status || 'Operational'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-sm font-medium">{systemStatus.apiServices?.responseTime || 0}ms</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Database</CardTitle>
                <CardDescription>MongoDB connection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.database.status || 'healthy')}
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.database.status || 'healthy')}`}>
                  {systemStatus.database.status || 'Healthy'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-sm font-medium">{systemStatus.database.responseTime || 0}ms</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
              <span className={`text-sm font-medium ${systemStatus.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus.database.connected ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Email Service */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Email Service</CardTitle>
                <CardDescription>SMTP and delivery</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.emailService?.status || 'operational')}
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.emailService?.status || 'operational')}`}>
                  {systemStatus.emailService?.status || 'Operational'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</span>
              <span className="text-sm font-medium">{systemStatus.emailService?.deliveryRate || 99.9}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">SMTP Configured</span>
              <span className={`text-sm font-medium ${systemStatus.emailService?.smtpConfigured ? 'text-green-600' : 'text-red-600'}`}>
                {systemStatus.emailService?.smtpConfigured ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
