'use client';

import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';

interface TemplatePreviewErrorProps {
  error: string;
  onBack: () => void;
}

export function TemplatePreviewError({ error, onBack }: TemplatePreviewErrorProps) {
  return (
    <DashboardLayout
      title="Template Not Found"
      description="The template you're looking for doesn't exist or has been removed."
    >
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    </DashboardLayout>
  );
}
