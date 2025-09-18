'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateTemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const router = useRouter();

  return (
    <DashboardLayout
      title="Create Email Template"
      description="Create a reusable email template with variables for your campaigns"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      }
    >
      <CreateTemplateForm />
    </DashboardLayout>
  );
}