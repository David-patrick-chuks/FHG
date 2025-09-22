'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAPI, CreateIncidentData, Incident, UpdateIncidentData } from '@/lib/api/admin';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Loader2,
    Plus,
    RefreshCw,
    Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminIncidentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateIncidentData>({
    title: '',
    description: '',
    impact: 'minor',
    affectedServices: [],
    initialMessage: ''
  });
  const [updateForm, setUpdateForm] = useState<UpdateIncidentData>({
    message: '',
    status: 'investigating'
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchIncidents();
  }, [user, router]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAllIncidents();
      if (response.success && response.data) {
        setIncidents(response.data);
      }
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast.error('Failed to load incidents');
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

  const getImpactBadge = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Critical</Badge>;
      case 'major':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Major</Badge>;
      case 'minor':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Minor</Badge>;
      default:
        return <Badge variant="secondary">{impact}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Investigating</Badge>;
      case 'identified':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Identified</Badge>;
      case 'monitoring':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Monitoring</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'investigating':
        return <Search className="w-4 h-4" />;
      case 'identified':
        return <Eye className="w-4 h-4" />;
      case 'monitoring':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesImpact = impactFilter === 'all' || incident.impact === impactFilter;
    return matchesSearch && matchesStatus && matchesImpact;
  });

  const handleCreateIncident = async () => {
    try {
      setCreateLoading(true);
      const response = await AdminAPI.createIncident(createForm);
      if (response.success) {
        toast.success('Incident created successfully');
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          impact: 'minor',
          affectedServices: [],
          initialMessage: ''
        });
        fetchIncidents();
      } else {
        toast.error('Failed to create incident');
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
      toast.error('Failed to create incident');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;

    try {
      setUpdateLoading(true);
      const response = await AdminAPI.updateIncident(selectedIncident._id, updateForm);
      if (response.success) {
        toast.success('Incident updated successfully');
        setShowUpdateModal(false);
        setSelectedIncident(null);
        setUpdateForm({ message: '', status: 'investigating' });
        fetchIncidents();
      } else {
        toast.error('Failed to update incident');
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
      toast.error('Failed to update incident');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const response = await AdminAPI.resolveIncident(incidentId);
      if (response.success) {
        toast.success('Incident resolved successfully');
        fetchIncidents();
      } else {
        toast.error('Failed to resolve incident');
      }
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      toast.error('Failed to resolve incident');
    }
  };

  const openUpdateModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setUpdateForm({
      message: '',
      status: incident.status
    });
    setShowUpdateModal(true);
  };

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Incident Management"
        description="Manage system incidents and outages"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Incident Management"
      description="Manage system incidents and outages"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchIncidents}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Incident
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Filter by impact"
                >
                  <option value="all">All Impact</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <Card key={incident._id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                          {getStatusIcon(incident.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white break-words">
                            {incident.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                            {incident.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {getImpactBadge(incident.impact)}
                            {getStatusBadge(incident.status)}
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateModal(incident)}
                      >
                        Update
                      </Button>
                      {incident.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveIncident(incident._id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Updates Timeline */}
                  {incident.updates && incident.updates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Updates ({incident.updates.length})
                      </h4>
                      <div className="space-y-3">
                        {incident.updates.slice(-3).map((update, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {update.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(update.status)}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(update.timestamp)}
                                </span>
                                {update.author && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    by {update.author}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No incidents found</p>
                  <p className="text-sm mt-2">Incidents will appear here when they occur</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Incident</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Brief description of the incident"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detailed description of the incident"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Impact *
                </label>
                <select
                  value={createForm.impact}
                  onChange={(e) => setCreateForm({ ...createForm, impact: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Select impact level"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Affected Services
                </label>
                <Input
                  value={createForm.affectedServices.join(', ')}
                  onChange={(e) => setCreateForm({ 
                    ...createForm, 
                    affectedServices: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Database, API Service, Email Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Message
                </label>
                <Textarea
                  value={createForm.initialMessage}
                  onChange={(e) => setCreateForm({ ...createForm, initialMessage: e.target.value })}
                  placeholder="Initial status message for users"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateIncident}
                  disabled={createLoading || !createForm.title || !createForm.description}
                  className="flex-1"
                >
                  {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Incident
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Incident Modal */}
      {showUpdateModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Update Incident: {selectedIncident.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Select status"
                >
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Update Message *
                </label>
                <Textarea
                  value={updateForm.message}
                  onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                  placeholder="Describe the current status and any actions taken"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateIncident}
                  disabled={updateLoading || !updateForm.message}
                  className="flex-1"
                >
                  {updateLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Incident
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
