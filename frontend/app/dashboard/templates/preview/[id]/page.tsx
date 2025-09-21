'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TemplateHeader } from '@/components/templates/preview/TemplateHeader';
import { TemplatePreviewActions } from '@/components/templates/preview/TemplatePreviewActions';
import { TemplatePreviewError } from '@/components/templates/preview/TemplatePreviewError';
import { TemplatePreviewLoading } from '@/components/templates/preview/TemplatePreviewLoading';
import { TemplateReviews } from '@/components/templates/preview/TemplateReviews';
import { TemplateSamples } from '@/components/templates/preview/TemplateSamples';
import { TemplateVariables } from '@/components/templates/preview/TemplateVariables';
import { useTemplatePreview } from '@/hooks/useTemplatePreview';

interface TemplatePreviewPageProps {
  params: { id: string };
}

export default function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
  const {
    template,
    loading,
    error,
    adding,
    userRating,
    userReview,
    submittingReview,
    copiedSample,
    variableValues,
    validationErrors,
    handleAddToMyTemplates,
    handleVariableChange,
    handleSubmitReview,
    copySampleToClipboard,
    handleBack,
    setUserRating,
    setUserReview
  } = useTemplatePreview(params.id);

  if (loading) {
    return <TemplatePreviewLoading />;
  }

  if (error || !template) {
    return <TemplatePreviewError error={error || 'Template not found'} onBack={handleBack} />;
  }

  return (
    <DashboardLayout 
      title="Template Preview"
      description="Preview template details, samples, and add to your collection"
      actions={
        <TemplatePreviewActions
          adding={adding}
          onBack={handleBack}
          onAddToTemplates={handleAddToMyTemplates}
        />
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Template Header */}
        <TemplateHeader template={template} />

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Variables Section */}
          <TemplateVariables
            template={template}
            variableValues={variableValues}
            validationErrors={validationErrors}
            onVariableChange={handleVariableChange}
          />

          {/* Reviews Section */}
          <TemplateReviews
            template={template}
            userRating={userRating}
            userReview={userReview}
            submittingReview={submittingReview}
            onRatingChange={setUserRating}
            onReviewChange={setUserReview}
            onSubmitReview={handleSubmitReview}
          />
                </div>

        {/* Sample Emails Section */}
        <TemplateSamples
          template={template}
          copiedSample={copiedSample}
          onCopySample={copySampleToClipboard}
        />
      </div>
    </DashboardLayout>
  );
}
