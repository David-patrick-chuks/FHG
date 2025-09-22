'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TemplatesAPI } from '@/lib/api/templates';
import { CreateTemplateRequest, Template, TemplateCategory } from '@/types';
import { FileText, Plus, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated: (template: Template) => void;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onTemplateCreated
}: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    category: 'sales',
    industry: '',
    targetAudience: '',
    isPublic: false,
    samples: [],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [newSample, setNewSample] = useState({
    title: '',
    content: '',
    useCase: '',
    variables: []
  });
  const [newVariable, setNewVariable] = useState({
    name: '',
    description: '',
    required: false,
    defaultValue: ''
  });
  const [creating, setCreating] = useState(false);

  const categoryOptions: { value: TemplateCategory; label: string }[] = [
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
    { value: 'networking', label: 'Networking' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'customer_success', label: 'Customer Success' },
    { value: 'recruitment', label: 'Recruitment' },
    { value: 'event_invitation', label: 'Event Invitation' },
    { value: 'thank_you', label: 'Thank You' },
    { value: 'apology', label: 'Apology' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'feedback_request', label: 'Feedback Request' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.samples.length < 10) {
      toast.error('Template must have at least 10 samples');
      return;
    }

    try {
      setCreating(true);
      const response = await TemplatesAPI.createTemplate(formData);
      
      if (response.success && response.data) {
        onTemplateCreated(response.data);
        toast.success('Template created successfully!');
        resetForm();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'sales',
      industry: '',
      targetAudience: '',
      isPublic: false,
      samples: [],
      tags: []
    });
    setNewTag('');
    setNewSample({
      title: '',
      content: '',
      useCase: '',
      variables: []
    });
    setNewVariable({
      name: '',
      description: '',
      required: false,
      defaultValue: ''
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVariable = () => {
    if (newVariable.name.trim()) {
      setNewSample(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({
        name: '',
        description: '',
        required: false,
        defaultValue: ''
      });
    }
  };

  const removeVariable = (index: number) => {
    setNewSample(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const addSample = () => {
    if (newSample.title.trim() && newSample.content.trim()) {
      setFormData(prev => ({
        ...prev,
        samples: [...prev.samples, { ...newSample }]
      }));
      setNewSample({
        title: '',
        content: '',
        useCase: '',
        variables: []
      });
    }
  };

  const removeSample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      samples: prev.samples.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new email template with at least 10 samples. Templates can be made public for the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sales Follow-up Template"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TemplateCategory }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template is for and when to use it..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., C-level executives, Small business owners"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Make this template public for the community</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Samples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email Samples ({formData.samples.length}/10 minimum)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Sample */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sampleTitle">Sample Title *</Label>
                    <Input
                      id="sampleTitle"
                      value={newSample.title}
                      onChange={(e) => setNewSample(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Follow-up after meeting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sampleUseCase">Use Case</Label>
                    <Input
                      id="sampleUseCase"
                      value={newSample.useCase}
                      onChange={(e) => setNewSample(prev => ({ ...prev, useCase: e.target.value }))}
                      placeholder="When to use this sample"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleContent">Email Content *</Label>
                  <Textarea
                    id="sampleContent"
                    value={newSample.content}
                    onChange={(e) => setNewSample(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your email content here. Use {{variableName}} for dynamic content..."
                    rows={4}
                  />
                </div>

                {/* Variables */}
                <div className="space-y-2">
                  <Label>Variables (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Variable name (e.g., companyName)"
                      className="flex-1"
                    />
                    <Input
                      value={newVariable.description}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addVariable} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newSample.variables.length > 0 && (
                    <div className="space-y-1">
                      {newSample.variables.map((variable, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{variable.name}</Badge>
                          <span className="text-gray-600 dark:text-gray-400">{variable.description}</span>
                          <button
                            type="button"
                            onClick={() => removeVariable(index)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove variable"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="button" onClick={addSample} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sample
                </Button>
              </div>

              {/* Existing Samples */}
              {formData.samples.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Samples ({formData.samples.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.samples.map((sample, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{sample.title}</span>
                          {sample.variables.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {sample.variables.map((variable, varIndex) => (
                                <Badge key={varIndex} variant="secondary" className="text-xs">
                                  {variable.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeSample(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || formData.samples.length < 10}>
              {creating ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
