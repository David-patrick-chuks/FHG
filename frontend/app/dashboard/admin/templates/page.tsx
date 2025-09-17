'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { ApproveTemplateRequest, TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Loader2,
    RefreshCw,
    Tag,
    User,
    XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchPendingTemplates();
  }, [user, router]);

  const fetchPendingTemplates = async () => {
    try {
      setLoading(true);
      const response = await TemplatesAPI.getPendingApprovals();
      if (response.success && response.data) {
        setPendingTemplates(response.data);
      } else {
        toast.error('Failed to load pending templates');
      }
    } catch (error) {
      toast.error('Failed to load pending templates');
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
        setPendingTemplates(prev => prev.filter(t => t._id !== templateId));
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
        setPendingTemplates(prev => prev.filter(t => t._id !== templateId));
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
      title="Template Approvals"
      description="Review and approve community templates"
      actions={
        <Button
          variant="outline"
          onClick={fetchPendingTemplates}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {pendingTemplates.length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {pendingTemplates.filter(t => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(t.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Age</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {pendingTemplates.length > 0 
                      ? Math.round(pendingTemplates.reduce((sum, t) => {
                          const days = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                          return sum + days;
                        }, 0) / pendingTemplates.length)
                      : 0
                    }d
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Templates ({pendingTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pending templates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All templates have been reviewed and approved.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Pending Approval
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {template.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {template.category}
                            </span>
                          </div>
                          
                          {template.industry && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {template.industry}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(template.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {template.samples?.length || 0} samples
                            </span>
                          </div>
                        </div>

                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {template.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/dashboard/templates/preview/${template._id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectDialog(template)}
                          disabled={processingId === template._id}
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {processingId === template._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleApprove(template._id)}
                          disabled={processingId === template._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingId === template._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
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
      </div>
    </DashboardLayout>
  );
}
