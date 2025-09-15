'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    Copy,
    FileText,
    MessageSquare,
    Plus,
    Star,
    Tag,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TemplatePreviewPageProps {
  params: { id: string };
}

export default function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedSample, setCopiedSample] = useState<number | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplate();
  }, [params.id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TemplatesAPI.getTemplate(params.id);
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        setError(response.message || 'Template not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const validateVariables = () => {
    if (!template?.variables) return true;
    
    const errors: Record<string, string> = {};
    let isValid = true;
    
    template.variables.forEach(variable => {
      if (variable.required && (!variableValues[variable.key] || variableValues[variable.key].trim() === '')) {
        errors[variable.key] = `${variable.key} is required`;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleAddToMyTemplates = async () => {
    if (!template) return;
    
    // Validate variables first
    if (!validateVariables()) {
      toast.error('Please fill in all required variables before adding the template');
      return;
    }
    
    try {
      setAdding(true);
      const response = await TemplatesAPI.useTemplate(template._id);
      if (response.success) {
        toast.success('Template added to your collection!');
        router.push('/dashboard/templates');
      } else {
        toast.error(response.message || 'Failed to add template');
      }
    } catch (err) {
      toast.error('Failed to add template');
    } finally {
      setAdding(false);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear validation error for this variable
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!template || !userRating || !userReview.trim()) return;
    
    try {
      setSubmittingReview(true);
      const response = await TemplatesAPI.reviewTemplate(template._id, {
        rating: userRating,
        comment: userReview
      });
      
      if (response.success) {
        toast.success('Review submitted successfully!');
        setUserReview('');
        setUserRating(0);
        // Reload template to get updated ratings
        loadTemplate();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const copySampleToClipboard = async (sample: any, index: number) => {
    try {
      const text = `Subject: ${sample.subject}\n\n${sample.body}`;
      await navigator.clipboard.writeText(text);
      setCopiedSample(index);
      toast.success('Sample copied to clipboard!');
      setTimeout(() => setCopiedSample(null), 2000);
    } catch (err) {
      toast.error('Failed to copy sample');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Loading Template..."
        description="Please wait while we load the template details."
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !template) {
    return (
      <DashboardLayout
        title="Template Not Found"
        description="The template you're looking for doesn't exist or has been removed."
      >
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard/templates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/templates')}
            className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {template.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{template.description}</p>
          </div>
        </div>
      }
      description="Preview template details, samples, and add to your collection"
      actions={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/templates')}
            className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToMyTemplates}
            disabled={adding}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : 'Add to My Templates'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Template Overview */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                    {template.category}
                  </Badge>
                  {template.industry && (
                    <Badge variant="outline" className="border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300">
                      {template.industry}
                    </Badge>
                  )}
                  {template.featured && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    {template.samples?.length || 0} samples
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <Tag className="w-3 h-3 text-white" />
                    </div>
                    {template.variables?.length || 0} variables
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    {template.usageCount} uses
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <Calendar className="w-3 h-3 text-white" />
                    </div>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-cyan-500 fill-current" />
                  <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {template.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.rating?.count || 0} reviews
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Use Case</h3>
                <p className="text-gray-600 dark:text-gray-400">{template.useCase}</p>
              </div>
              
              {template.targetAudience && (
                <div>
                  <h3 className="font-semibold mb-2">Target Audience</h3>
                  <p className="text-gray-600 dark:text-gray-400">{template.targetAudience}</p>
                </div>
              )}

              {template.tags && template.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Variables */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Variables
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in these variables to customize your email
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template.variables?.map((variable, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={variable.key} className="text-sm font-medium">
                        <code className="text-sm font-mono bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 px-2 py-1 rounded">
                          {`{{${variable.key}}}`}
                        </code>
                      </Label>
                      {variable.required && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs border-0">
                          Required
                        </Badge>
                      )}
                    </div>
                    <Input
                      id={variable.key}
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      placeholder={variable.value}
                      className={`transition-all duration-200 ${
                        validationErrors[variable.key] 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400'
                      }`}
                    />
                    {validationErrors[variable.key] && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors[variable.key]}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {variable.value}
                    </p>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                      <Tag className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No variables defined</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">This template is static</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating & Reviews */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Reviews & Ratings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your experience with this template
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Review Form */}
                <div className="p-4 border border-cyan-200 dark:border-cyan-800 rounded-lg bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10">
                  <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300">Rate this template</h4>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="text-2xl hover:scale-110 transition-transform"
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? 'text-cyan-500 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your thoughts about this template..."
                    className="w-full p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg resize-none bg-white/50 dark:bg-gray-800/50 focus:border-cyan-500 focus:ring-cyan-500 dark:focus:border-cyan-400"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !userRating || !userReview.trim()}
                    className="mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
                    size="sm"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>

                {/* Recent Reviews */}
                {template.reviews && template.reviews.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300">Recent Reviews</h4>
                    <div className="space-y-3">
                      {template.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg bg-white/30 dark:bg-gray-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-cyan-500 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Emails */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Sample Emails
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preview the actual email content and copy samples to your clipboard
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.samples?.map((sample, index) => (
                <div key={index} className="border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 bg-gradient-to-br from-cyan-50/30 to-blue-50/30 dark:from-cyan-900/10 dark:to-blue-900/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-cyan-700 dark:text-cyan-300">Sample {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copySampleToClipboard(sample, index)}
                      className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                    >
                      {copiedSample === index ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                        Subject:
                      </label>
                      <p className="mt-1 p-3 bg-white/50 dark:bg-gray-800/50 rounded border border-cyan-200 dark:border-cyan-800">
                        {sample.subject}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                        Body:
                      </label>
                      <div className="mt-1 p-3 bg-white/50 dark:bg-gray-800/50 rounded border border-cyan-200 dark:border-cyan-800 whitespace-pre-wrap">
                        {sample.body}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                    <FileText className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No samples available</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">This template doesn't have sample emails</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
