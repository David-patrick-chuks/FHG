'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TemplatesAPI } from '@/lib/api/templates';
import { CreateTemplateRequest, Template, TemplateCategory } from '@/types';
import { ArrowLeft, FileText, Plus, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateTemplatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Set up your template foundation' },
    { id: 2, title: 'Samples', description: 'Add email samples and variables' },
    { id: 3, title: 'Review', description: 'Review and create your template' }
  ];

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

  // Validation functions
  const canProceedToStep2 = formData.name.trim() && 
                           formData.description.trim() && 
                           formData.category;
  
  const canProceedToStep3 = canProceedToStep2 && 
                           formData.samples.length >= 10;
  
  const canCreateTemplate = canProceedToStep3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.samples.length < 10) {
      toast.error('Template must have at least 10 samples');
      return;
    }

    try {
      setIsLoading(true);
      const response = await TemplatesAPI.createTemplate(formData);
      
      if (response.success && response.data) {
        toast.success('Template created successfully!');
        router.push('/dashboard/templates');
      } else {
        toast.error(response.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
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
    <DashboardLayout
      title="Create New Template"
      description="Create a comprehensive email template with multiple samples and variables"
      actions={
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    currentStep >= step.id 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 transition-all duration-300 ${
                      currentStep > step.id 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl">Basic Information</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                      Set up your template's basic details and categorization
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Template Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sales Follow-up Template"
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a descriptive name for your template
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TemplateCategory }))}>
                      <SelectTrigger className="h-12">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select the most appropriate category
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this template is for and when to use it..."
                    rows={3}
                    required
                    className="resize-none border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Provide a clear description of the template's purpose
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Industry (Optional)
                    </Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare"
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Specify the target industry if applicable
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Target Audience (Optional)
                    </Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="e.g., C-level executives, Small business owners"
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Define your target audience
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="isPublic" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Make this template public for the community
                  </Label>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tags
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="h-12"
                    />
                    <Button type="button" onClick={addTag} size="sm" className="h-12">
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
                </div>
              </CardContent>
              <div className="flex justify-end p-6 pt-0">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Samples
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Samples */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl">Email Samples</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                      Add at least 10 email samples with variables ({formData.samples.length}/10 minimum)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Sample */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Add New Sample</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sampleTitle">Sample Title *</Label>
                      <Input
                        id="sampleTitle"
                        value={newSample.title}
                        onChange={(e) => setNewSample(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Follow-up after meeting"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sampleUseCase">Use Case</Label>
                      <Input
                        id="sampleUseCase"
                        value={newSample.useCase}
                        onChange={(e) => setNewSample(prev => ({ ...prev, useCase: e.target.value }))}
                        placeholder="When to use this sample"
                        className="h-12"
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
                      className="resize-none"
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
                        className="flex-1 h-12"
                      />
                      <Input
                        value={newVariable.description}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        className="flex-1 h-12"
                      />
                      <Button type="button" onClick={addVariable} size="sm" className="h-12">
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

                  <Button type="button" onClick={addSample} className="w-full h-12">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sample
                  </Button>
                </div>

                {/* Existing Samples */}
                {formData.samples.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Added Samples ({formData.samples.length})</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.samples.map((sample, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
              <div className="flex justify-between p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-12 px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Basic Info
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="h-12 px-8 bg-green-600 hover:bg-green-700"
                >
                  Continue to Review
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl">Review & Create</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                      Review your template details before creating
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Template Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</Label>
                      <p className="text-gray-900 dark:text-white">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</Label>
                      <p className="text-gray-900 dark:text-white">{categoryOptions.find(c => c.value === formData.category)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</Label>
                      <p className="text-gray-900 dark:text-white">{formData.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Target Audience</Label>
                      <p className="text-gray-900 dark:text-white">{formData.targetAudience || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Visibility</Label>
                      <p className="text-gray-900 dark:text-white">{formData.isPublic ? 'Public' : 'Private'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Samples</Label>
                      <p className="text-gray-900 dark:text-white">{formData.samples.length} samples</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                    <p className="text-gray-900 dark:text-white">{formData.description}</p>
                  </div>
                  {formData.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Samples Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Samples Preview</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.samples.slice(0, 5).map((sample, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{sample.title}</h4>
                          {sample.variables.length > 0 && (
                            <div className="flex gap-1">
                              {sample.variables.map((variable, varIndex) => (
                                <Badge key={varIndex} variant="outline" className="text-xs">
                                  {variable.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {sample.content}
                        </p>
                      </div>
                    ))}
                    {formData.samples.length > 5 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        ... and {formData.samples.length - 5} more samples
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-between p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="h-12 px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Samples
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!canCreateTemplate || isLoading}
                  className="h-12 px-8 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating Template...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
