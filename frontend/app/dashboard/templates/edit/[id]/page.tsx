'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateTemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditTemplatePageProps {
  params: { id: string };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleTemplateUpdated = (updatedTemplate: Template) => {
    toast.success('Template updated successfully!');
    router.push('/dashboard/templates');
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
      title="Edit Template"
      description={`Update your email template: ${template.name}`}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">← Back</span>
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <CreateTemplateForm 
              initialData={template}
              onTemplateCreated={handleTemplateUpdated}
              isEditMode={true}
              templateId={template._id}
              isCloned={!!template.originalTemplateId}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
