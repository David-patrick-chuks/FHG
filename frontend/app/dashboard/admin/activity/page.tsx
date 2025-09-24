'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAPI, AdminActivityStats, Incident, SystemActivity, SystemActivityStats } from '@/lib/api/admin';
import {
    Activity,
    Bot,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    Settings,
    Shield,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminActivityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [adminActivityStats, setAdminActivityStats] = useState<AdminActivityStats | null>(null);
  const [systemActivityStats, setSystemActivityStats] = useState<SystemActivityStats | null>(null);
  const [systemActivities, setSystemActivities] = useState<SystemActivity[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [daysFilter, setDaysFilter] = useState<number>(7);
  const [activeTab, setActiveTab] = useState<'admin' | 'system' | 'incidents'>('admin');

  const handleTabChange = (tab: 'admin' | 'system' | 'incidents') => {
    setActiveTab(tab);
    setActivityTypeFilter('all'); // Reset filter when switching tabs
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router, daysFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminActionsResponse, adminStatsResponse, systemResponse, systemActivitiesResponse] = await Promise.all([
        AdminAPI.getAdminActions(undefined, undefined, daysFilter),
        AdminAPI.getGeneralAdminActivityStats(daysFilter),
        AdminAPI.getSystemActivityStats(daysFilter),
        AdminAPI.getSystemActivities({ days: daysFilter })
      ]);

      // Process admin actions to create stats
      if (adminActionsResponse.success && adminActionsResponse.data) {
        const actions = adminActionsResponse.data;
        
        setAdminActivityStats({
          totalActions: actions.length,
          actionsByType: {},
          actionsByAdmin: {},
          recentActions: actions.slice(0, 10).map(action => ({
            _id: action._id,
            adminId: action.adminId,
            action: action.action,
            targetType: action.targetType,
            targetId: action.targetId,
            details: action.details,
            ipAddress: action.ipAddress,
            userAgent: (action as any).userAgent || 'Unknown',
            createdAt: action.createdAt
          }))
        });
      }

      // Use backend stats if available
      if (adminStatsResponse.success && adminStatsResponse.data) {
        const backendStats = adminStatsResponse.data;
        setAdminActivityStats(prev => ({
          ...prev,
          totalActions: backendStats.totalActions,
          actionsByType: backendStats.actionsByType,
          actionsByAdmin: backendStats.actionsByAdmin
        }));
      }

      if (systemResponse.success && systemResponse.data) {
        setSystemActivityStats(systemResponse.data);
      }

        if (systemActivitiesResponse.success && systemActivitiesResponse.data) {
          setSystemActivities(systemActivitiesResponse.data);
        }

        // Fetch incidents
        const incidentsResponse = await AdminAPI.getAllIncidents();
        if (incidentsResponse.success && incidentsResponse.data) {
          setIncidents(incidentsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'campaign':
        return <Mail className="w-4 h-4" />;
      case 'subscription':
        return <Settings className="w-4 h-4" />;
      case 'system_error':
        return <Shield className="w-4 h-4" />;
      case 'system_maintenance':
        return <Settings className="w-4 h-4" />;
      case 'system_backup':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Create</Badge>;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Update</Badge>;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Delete</Badge>;
    } else if (actionLower.includes('suspend') || actionLower.includes('ban')) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Suspend</Badge>;
    } else if (actionLower.includes('activate') || actionLower.includes('enable')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Activate</Badge>;
    } else {
      return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getActivityTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user_created':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">User Created</Badge>;
      case 'user_updated':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">User Updated</Badge>;
      case 'subscription_created':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Subscription</Badge>;
      case 'campaign_created':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Campaign</Badge>;
      case 'email_extraction_started':
        return <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">Email Extraction</Badge>;
      default:
        return <Badge variant="secondary">{type.replace(/_/g, ' ')}</Badge>;
    }
  };

  const getSystemActivityBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'system_error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">System Error</Badge>;
      case 'system_maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Maintenance</Badge>;
      case 'system_backup':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Backup</Badge>;
      case 'system_restore':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Restore</Badge>;
      default:
        return <Badge variant="secondary">{type.replace(/_/g, ' ')}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const filteredAdminActivities = adminActivityStats?.recentActions?.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.targetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activityTypeFilter === 'all' || activity.targetType === activityTypeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const filteredSystemActivities = systemActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activityTypeFilter === 'all' || activity.type === activityTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activityTypeFilter === 'all' || incident.status === activityTypeFilter;
    return matchesSearch && matchesType;
  });


  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Activity Logs"
        description="Monitor admin and system activities"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Activity Logs"
      description="Monitor admin and system activities"
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto">
            <span className="whitespace-nowrap">Period:</span>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(parseInt(e.target.value))}
              className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Activity Statistics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Actions</span>
                  <span className="font-semibold">{adminActivityStats?.totalActions || 0}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actions by Type:</p>
                  {adminActivityStats?.actionsByType && Object.entries(adminActivityStats.actionsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{type.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Activities</span>
                  <span className="font-semibold">{systemActivityStats?.totalActivities || 0}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activities by Type:</p>
                  {systemActivityStats?.activitiesByType && Object.entries(systemActivityStats.activitiesByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{type.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Activity Logs</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant={activeTab === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTabChange('admin')}
                  className="flex-1 sm:flex-none"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
                <Button
                  variant={activeTab === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTabChange('system')}
                  className="flex-1 sm:flex-none"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  System
                </Button>
                <Button
                  variant={activeTab === 'incidents' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTabChange('incidents')}
                  className="flex-1 sm:flex-none"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Incidents
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Filter by activity type"
                >
                  <option value="all">All Types</option>
                  {activeTab === 'admin' ? (
                    <>
                  <option value="user">User</option>
                  <option value="bot">Bot</option>
                  <option value="campaign">Campaign</option>
                  <option value="subscription">Subscription</option>
                    </>
                  ) : activeTab === 'system' ? (
                    <>
                      <option value="system_error">System Error</option>
                      <option value="system_maintenance">Maintenance</option>
                      <option value="system_backup">Backup</option>
                      <option value="system_restore">Restore</option>
                    </>
                  ) : (
                    <>
                      <option value="investigating">Investigating</option>
                      <option value="identified">Identified</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
              {activeTab === 'admin' ? (
                filteredAdminActivities.length > 0 ? (
                  filteredAdminActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                          {getActivityIcon(activity.targetType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white break-words">
                            {activity.action.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                            {activity.targetType}: {activity.targetId}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getActionBadge(activity.action)}
                            <Badge variant="outline" className="text-xs">
                              {activity.adminId}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(activity.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          IP: {activity.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No admin activities found</p>
                  </div>
                )
              ) : activeTab === 'system' ? (
                filteredSystemActivities.length > 0 ? (
                  filteredSystemActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white break-words">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                            {activity.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getSystemActivityBadge(activity.type)}
                            {getSeverityBadge(activity.severity)}
                            {activity.resolved && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          System Event
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No system activities found</p>
                    <p className="text-sm mt-2">System events will appear here when they occur</p>
                  </div>
                )
              ) : activeTab === 'incidents' ? (
                filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <div
                      key={incident._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                          <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white break-words">
                            {incident.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                            {incident.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge 
                              className={
                                incident.impact === 'critical' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : incident.impact === 'major'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }
                            >
                              {incident.impact}
                            </Badge>
                            <Badge 
                              className={
                                incident.status === 'resolved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : incident.status === 'investigating'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : incident.status === 'identified'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }
                            >
                              {incident.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {incident.affectedServices.length} services
                            </Badge>
                </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Created: {formatDate(incident.createdAt)}
                            </p>
                            {incident.resolvedAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Resolved: {formatDate(incident.resolvedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No incidents found</p>
                    <p className="text-sm mt-2">Incidents will appear here when they occur</p>
                  </div>
                )
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
