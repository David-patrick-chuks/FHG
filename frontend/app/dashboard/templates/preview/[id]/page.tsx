'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Star, 
  Tag, 
  Users, 
  Calendar, 
  FileText, 
  Plus,
  ThumbsUp,
  MessageSquare,
  Copy,
  Check
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

  const handleAddToMyTemplates = async () => {
    if (!template) return;
    
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
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
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
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToMyTemplates}
            disabled={adding}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : 'Add to My Templates'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Template Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.industry && (
                    <Badge variant="outline">{template.industry}</Badge>
                  )}
                  {template.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {template.samples?.length || 0} samples
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {template.variables?.length || 0} variables
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {template.usageCount} uses
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{template.rating?.average?.toFixed(1) || '0.0'}</span>
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
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Variables</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize these variables for each email
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.variables?.map((variable, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {`{{${variable.key}}}`}
                      </code>
                      {variable.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {variable.value}
                    </p>
                  </div>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No variables defined
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating & Reviews */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your experience with this template
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Review Form */}
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium mb-3">Rate this template</h4>
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
                              ? 'text-yellow-400 fill-current'
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
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !userRating || !userReview.trim()}
                    className="mt-3"
                    size="sm"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>

                {/* Recent Reviews */}
                {template.reviews && template.reviews.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recent Reviews</h4>
                    <div className="space-y-3">
                      {template.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
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
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Sample Emails</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preview the actual email content and copy samples to your clipboard
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.samples?.map((sample, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Sample {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copySampleToClipboard(sample, index)}
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
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Subject:
                      </label>
                      <p className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                        {sample.subject}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Body:
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border whitespace-pre-wrap">
                        {sample.body}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No samples available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
