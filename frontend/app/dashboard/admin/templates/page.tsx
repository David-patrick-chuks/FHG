'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { ApproveTemplateRequest, CreateTemplateRequest, TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import {
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Tag,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Form states
  const [templateForm, setTemplateForm] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    category: '',
    industry: '',
    targetAudience: '',
    isPublic: true,
    useCase: '',
    variables: [],
    tags: [],
    samples: []
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchAllTemplates();
  }, [user, router]);

  const fetchAllTemplates = async () => {
    try {
      setLoading(true);
      // Get all templates for admin (including pending, approved, and rejected)
      const response = await TemplatesAPI.getAllTemplatesForAdmin();
      if (response.success && response.data) {
        setAllTemplates(response.data);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (templateId: string) => {
    try {
      setProcessingId(templateId);
      const approvalData: ApproveTemplateRequest = { approved: true };
      const response = await TemplatesAPI.approveTemplate(templateId, approvalData);
      
      if (response.success) {
        toast.success('Template approved successfully');
        fetchAllTemplates(); // Refresh all templates
      } else {
        toast.error(response.message || 'Failed to approve template');
      }
    } catch (error) {
      toast.error('Failed to approve template');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (templateId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(templateId);
      const approvalData: ApproveTemplateRequest = { 
        approved: false, 
        rejectionReason: rejectionReason.trim() 
      };
      const response = await TemplatesAPI.approveTemplate(templateId, approvalData);
      
      if (response.success) {
        toast.success('Template rejected successfully');
        fetchAllTemplates(); // Refresh all templates
        setShowRejectDialog(false);
        setRejectionReason('');
        setSelectedTemplate(null);
      } else {
        toast.error(response.message || 'Failed to reject template');
      }
    } catch (error) {
      toast.error('Failed to reject template');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setProcessingId('create');
      const response = await TemplatesAPI.createTemplate(templateForm);
      
      if (response.success) {
        toast.success('Template created successfully');
        setShowCreateDialog(false);
        resetForm();
        fetchAllTemplates();
      } else {
        toast.error(response.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setProcessingId(null);
    }
  };


  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setProcessingId('delete');
      const response = await TemplatesAPI.deleteTemplate(selectedTemplate._id);
      
      if (response.success) {
        toast.success('Template deleted successfully');
        setShowDeleteDialog(false);
        fetchAllTemplates();
      } else {
        toast.error(response.message || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setProcessingId(null);
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: '',
      industry: '',
      targetAudience: '',
      isPublic: true,
      useCase: '',
      variables: [],
      tags: [],
      samples: []
    });
    setSelectedTemplate(null);
  };


  const openDeleteDialog = (template: Template) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  const openRejectDialog = (template: Template) => {
    setSelectedTemplate(template);
    setShowRejectDialog(true);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter templates based on search and filters
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && !template.isApproved) ||
                         (statusFilter === 'approved' && template.isApproved) ||
                         (statusFilter === 'rejected' && template.isRejected);
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: allTemplates.length,
    pending: allTemplates.filter(t => !t.isApproved && !t.isRejected).length,
    approved: allTemplates.filter(t => t.isApproved).length,
    rejected: allTemplates.filter(t => t.isRejected).length,
    thisWeek: allTemplates.filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.createdAt) > weekAgo;
    }).length
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(allTemplates.map(t => t.category)));

  const getStatusBadge = (template: Template) => {
    if (template.isApproved) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />Approved
      </Badge>;
    } else if (template.isRejected) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
        <XCircle className="w-3 h-3 mr-1" />Rejected
      </Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs">
        <Clock className="w-3 h-3 mr-1" />Pending
      </Badge>;
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Template Approvals"
        description="Review and approve community templates"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Template Management"
      description="Manage all templates with full CRUD operations"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAllTemplates}
            disabled={loading}
            className="h-9 px-3 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.thisWeek}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search templates by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <Label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </Label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Templates ({filteredTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {allTemplates.length === 0 
                    ? "No templates have been created yet." 
                    : "No templates match your current filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {template.name}
                          </h3>
                          {getStatusBadge(template)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {template.tags && template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags && template.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        </div>
                        
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Category: {template.category}</p>
                        {template.industry && <p>Industry: {template.industry}</p>}
                        <p>Created: {formatDate(template.createdAt)}</p>
                        <p>Samples: {template.samples?.length || 0}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/dashboard/templates/preview/${template._id}`, '_blank')}
                          className="text-xs px-2 py-1 h-7"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/templates/edit/${template._id}`)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2 py-1 h-7"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        
                        {!template.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(template._id)}
                            disabled={processingId === template._id}
                            className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                          >
                            {processingId === template._id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Approve
                          </Button>
                        )}
                        
                        {!template.isRejected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectDialog(template)}
                            disabled={processingId === template._id}
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1 h-7"
                          >
                            {processingId === template._id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            Reject
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(template)}
                          disabled={processingId === template._id}
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1 h-7"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Template Info */}
                        <div className="xl:col-span-2 space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            {getStatusBadge(template)}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                          {template.description}
                        </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Tag className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {template.category}
                            </span>
                          </div>
                          
                          {template.industry && (
                              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {template.industry}
                              </span>
                            </div>
                          )}

                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatDate(template.createdAt)}
                            </span>
                          </div>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {template.samples?.length || 0} samples
                            </span>
                          </div>
                        </div>

                        {template.tags && template.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                            {template.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Actions
                          </div>
                          <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/dashboard/templates/preview/${template._id}`, '_blank')}
                              className="w-full justify-start"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                              Preview Template
                        </Button>
                        
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/templates/edit/${template._id}`)}
                              className="w-full justify-start text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Template
                            </Button>
                        
                        {!template.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(template._id)}
                            disabled={processingId === template._id}
                                className="w-full justify-start bg-green-600 hover:bg-green-700"
                          >
                            {processingId === template._id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                                Approve Template
                          </Button>
                        )}
                        
                        {!template.isRejected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectDialog(template)}
                            disabled={processingId === template._id}
                                className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {processingId === template._id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                                Reject Template
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(template)}
                          disabled={processingId === template._id}
                              className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                              Delete Template
                        </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Reason for rejection</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a reason for rejecting this template..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason('');
                    setSelectedTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedTemplate && handleReject(selectedTemplate._id)}
                  disabled={!rejectionReason.trim() || processingId === selectedTemplate?._id}
                >
                  {processingId === selectedTemplate?._id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Reject Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Input
                    id="template-category"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-industry">Industry</Label>
                  <Input
                    id="template-industry"
                    value={templateForm.industry}
                    onChange={(e) => setTemplateForm({ ...templateForm, industry: e.target.value })}
                    placeholder="Enter industry"
                  />
                </div>
                <div>
                  <Label htmlFor="template-use-case">Use Case</Label>
                  <Input
                    id="template-use-case"
                    value={templateForm.useCase}
                    onChange={(e) => setTemplateForm({ ...templateForm, useCase: e.target.value })}
                    placeholder="Enter use case"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={!templateForm.name || !templateForm.description || !templateForm.category || processingId === 'create'}
                >
                  {processingId === 'create' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* Delete Template Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTemplate}
                  disabled={processingId === 'delete'}
                >
                  {processingId === 'delete' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Delete Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
