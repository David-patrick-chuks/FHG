'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateTemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Tag } from 'lucide-react';
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
          className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-cyan-600" />
              Template Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTemplateForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}