'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommunityTemplatesTab } from '@/components/templates/CommunityTemplatesTab';
import { MyTemplatesTab } from '@/components/templates/MyTemplatesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { FileText, Plus, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-templates');
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<Template[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load my templates
      const myTemplatesResponse = await TemplatesAPI.getMyTemplates();
      if (myTemplatesResponse.success && myTemplatesResponse.data) {
        setMyTemplates(myTemplatesResponse.data);
      }

      // Load popular templates for community tab
      const popularResponse = await TemplatesAPI.getPopularTemplates(6);
      if (popularResponse.success && popularResponse.data) {
        setPopularTemplates(popularResponse.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreated = (newTemplate: Template) => {
    setMyTemplates(prev => [newTemplate, ...prev]);
  };

  const handleTemplateUpdated = (updatedTemplate: Template) => {
    setMyTemplates(prev => 
      prev.map(template => 
        template._id === updatedTemplate._id ? updatedTemplate : template
      )
    );
  };

  const handleTemplateDeleted = (templateId: string) => {
    setMyTemplates(prev => prev.filter(template => template._id !== templateId));
  };

  const handleCommunityTemplatesLoaded = (templates: Template[]) => {
    setCommunityTemplates(templates);
  };

  return (
    <DashboardLayout
      title="Email Templates"
      description="Create, manage, and discover email templates for your campaigns"
      actions={
        <Button
          onClick={() => router.push('/dashboard/templates/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Templates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{myTemplates.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Templates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{communityTemplates.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myTemplates.reduce((sum, template) => sum + template.usageCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-templates" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  My Templates
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Community
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-templates" className="p-6">
              <MyTemplatesTab
                templates={myTemplates}
                loading={loading}
                error={error}
                onTemplateUpdated={handleTemplateUpdated}
                onTemplateDeleted={handleTemplateDeleted}
                onRefresh={loadInitialData}
              />
            </TabsContent>

            <TabsContent value="community" className="p-6">
              <CommunityTemplatesTab
                popularTemplates={popularTemplates}
                onTemplatesLoaded={handleCommunityTemplatesLoaded}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </DashboardLayout>
  );
}
