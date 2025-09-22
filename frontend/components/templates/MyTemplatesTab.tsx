'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { format } from 'date-fns';
import { Calendar, Copy, Edit, Eye, FileText, MoreVertical, Star, Tag, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface MyTemplatesTabProps {
  templates: Template[];
  loading: boolean;
  error: string | null;
  onTemplateUpdated: (template: Template) => void;
  onTemplateDeleted: (templateId: string) => void;
  onRefresh: () => void;
}

export function MyTemplatesTab({
  templates,
  loading,
  error,
  onTemplateUpdated,
  onTemplateDeleted,
  onRefresh
}: MyTemplatesTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewTemplate = (template: Template) => {
    router.push(`/dashboard/templates/preview/${template._id}`);
  };

  const handleEditTemplate = (template: Template) => {
    router.push(`/dashboard/templates/edit/${template._id}`);
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      setDuplicating(template._id);
      
      // Create a copy of the template with a new name
      const duplicateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        industry: template.industry,
        targetAudience: template.targetAudience,
        isPublic: false, // Always make duplicates private
        useCase: template.useCase,
        variables: template.variables || [],
        tags: template.tags || [],
        samples: template.samples || []
      };

      const response = await TemplatesAPI.createTemplate(duplicateData);
      
      if (response.success && response.data) {
        toast.success('Template duplicated successfully!');
        onRefresh(); // Refresh the templates list
      } else {
        toast.error(response.message || 'Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    } finally {
      setDuplicating(null);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      setDeleting(true);
      const response = await TemplatesAPI.deleteTemplate(templateToDelete._id);
      
      if (response.success) {
        // Show success state in modal
        setDeleteSuccess(true);
        
        // Show success feedback
        toast.success('Template deleted successfully', {
          description: `"${templateToDelete.name}" has been permanently removed.`,
          duration: 4000,
        });
        
        // Remove template from local state
        onTemplateDeleted(templateToDelete._id);
        
        // Close modal after showing success state
        setTimeout(() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
          setDeleteSuccess(false);
        }, 1500);
        
      } else {
        toast.error(response.message || 'Failed to delete template');
        setDeleting(false);
      }
    } catch (error) {
      toast.error('Failed to delete template');
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Rejected' },
      published: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', label: 'Published' },
      archived: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="partnership">Partnership</SelectItem>
            <SelectItem value="customer_success">Customer Success</SelectItem>
            <SelectItem value="recruitment">Recruitment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'No templates found' 
              : 'No templates yet'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first email template to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </CardTitle>
                      {template.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDuplicateTemplate(template)}
                        disabled={duplicating === template._id}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {duplicating === template._id ? 'Duplicating...' : 'Duplicate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setTemplateToDelete(template);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Status and Category */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(template.status)}
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm">
                    {getCategoryLabel(template.category)}
                  </Badge>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {template.samples?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Samples</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {template.variables?.length || 0}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Variables</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      {template.usageCount}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Uses</div>
                  </div>
                </div>
                
                {/* Rating */}
                {template.rating && template.rating.count > 0 && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(template.rating.average) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      {template.rating.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      ({template.rating.count} reviews)
                    </span>
                  </div>
                )}

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs border-0">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs border-0">
                        +{template.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Calendar className="w-3 h-3" />
                  Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {deleteSuccess ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <div className="w-3 h-3 text-green-600 dark:text-green-400">✓</div>
                  </div>
                  Template Deleted
                </>
              ) : deleting ? (
                <>
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  Deleting Template...
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </div>
                  Delete Template
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {deleteSuccess ? (
                <div className="space-y-2">
                  <p className="text-green-600 dark:text-green-400">✅ <strong>"{templateToDelete?.name}"</strong> has been successfully deleted.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">The template has been permanently removed from your collection.</p>
                </div>
              ) : deleting ? (
                <div className="space-y-2">
                  <p>Please wait while we delete "{templateToDelete?.name}"...</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full animate-pulse w-3/5"></div>
                  </div>
                </div>
              ) : (
                <>
                  <p>Are you sure you want to delete <strong>"{templateToDelete?.name}"</strong>?</p>
                  <p className="text-red-600 dark:text-red-400 mt-2">⚠️ This action cannot be undone.</p>
                  {templateToDelete?.isPublic && templateToDelete?.usageCount > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 font-medium">⚠️ Warning</p>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                        This is a public template with <strong>{templateToDelete.usageCount} uses</strong>. 
                        Deleting it may affect other users.
                      </p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {deleteSuccess ? (
              <AlertDialogAction
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setTemplateToDelete(null);
                  setDeleteSuccess(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-600"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4">✓</div>
                  Done
                </div>
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel 
                  disabled={deleting}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTemplate}
                  disabled={deleting}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Template
                    </div>
                  )}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
