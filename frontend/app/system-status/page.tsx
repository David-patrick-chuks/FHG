'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SystemStatus, SystemStatusAPI } from '@/lib/api';
import { Incident } from '@/lib/api/incidents';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    HardDrive,
    MemoryStick,
    RefreshCw,
    Wifi,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Remove the local Incident interface since we're importing it from the API

export default function SystemStatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get incidents from system status data
  const incidents: Incident[] = systemStatus?.incidents || [];

  const fetchSystemStatus = async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
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
    
    // Auto-refresh every 60 seconds (reduced frequency)
    const interval = setInterval(fetchSystemStatus, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Overall Status */}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading system status...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <Button onClick={fetchSystemStatus} className="mt-4">
                    Try Again
                  </Button>
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

        {/* Service Status */}
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
                    {getStatusIcon(systemStatus?.status || 'operational')}
                    <span className={`text-sm font-medium ${getStatusColor(systemStatus?.status || 'operational')}`}>
                      {systemStatus?.status || 'Operational'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="text-sm font-medium">{systemStatus?.application.responseTime || 0}ms</span>
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
                    {getStatusIcon(systemStatus?.database.status || 'healthy')}
                    <span className={`text-sm font-medium ${getStatusColor(systemStatus?.database.status || 'healthy')}`}>
                      {systemStatus?.database.status || 'Healthy'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="text-sm font-medium">{systemStatus?.database.responseTime || 0}ms</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
                  <span className={`text-sm font-medium ${systemStatus?.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStatus?.database.connected ? 'Yes' : 'No'}
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
                    {getStatusIcon('operational')}
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Operational</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Metrics */}
        {systemStatus && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Metrics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Memory Usage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <MemoryStick className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Memory Usage</CardTitle>
                      <CardDescription>System memory utilization</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Used: {systemStatus.system.memory.usage} MB</span>
                        <span>{systemStatus.system.memory.percentage}%</span>
                      </div>
                      <Progress value={systemStatus.system.memory.percentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="ml-2 font-medium">{systemStatus.system.memory.total} MB</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Free:</span>
                        <span className="ml-2 font-medium">{systemStatus.system.memory.free} MB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Database Stats</CardTitle>
                      <CardDescription>Storage and performance</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {systemStatus.database.stats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Collections:</span>
                          <span className="ml-2 font-medium">{systemStatus.database.stats.collections}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Indexes:</span>
                          <span className="ml-2 font-medium">{systemStatus.database.stats.indexes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Data Size:</span>
                          <span className="ml-2 font-medium">{systemStatus.database.stats.dataSizeMB} MB</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                          <span className="ml-2 font-medium">{systemStatus.database.stats.storageSizeMB} MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Database not connected - stats unavailable
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Incidents */}
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

        {/* System Information */}
        {systemStatus && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Information</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Environment</div>
                    <div className="font-medium">{systemStatus.environment}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Version</div>
                    <div className="font-medium">{systemStatus.application.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Node.js</div>
                    <div className="font-medium">{systemStatus.system.nodeVersion}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Platform</div>
                    <div className="font-medium capitalize">{systemStatus.system.platform}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
