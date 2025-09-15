'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateTemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const router = useRouter();

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Create Email Template
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a reusable email template with variables for your campaigns
            </p>
          </div>
        </div>
      }
      description=""
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
      <div className="space-y-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Template Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Define your template details and variables
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CreateTemplateForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}