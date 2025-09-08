'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SystemStatus } from '@/lib/api/system-status';
import { MemoryStick, HardDrive, Database } from 'lucide-react';

interface SystemMetricsProps {
  systemStatus: SystemStatus | null;
}

export function SystemMetrics({ systemStatus }: SystemMetricsProps) {
  if (!systemStatus) return null;

  return (
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

      {/* System Information */}
      <div className="mt-8">
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
    </div>
  );
}
