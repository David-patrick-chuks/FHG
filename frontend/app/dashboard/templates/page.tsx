'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommunityTemplatesTab } from '@/components/templates/CommunityTemplatesTab';
import { MyTemplatesTab } from '@/components/templates/MyTemplatesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { FileText, Plus, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-templates');
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<Template[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [templateCounts, setTemplateCounts] = useState({
    myTemplates: 0,
    communityTemplates: 0,
    totalUsage: 0
  });
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

      // Load template counts (optimized single API call)
      const countsResponse = await TemplatesAPI.getTemplateCounts();
      if (countsResponse.success && countsResponse.data) {
        setTemplateCounts(countsResponse.data);
      }

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

  const handleTemplateAdded = async () => {
    // Refresh my templates and counts when a template is added from community
    try {
      const [myTemplatesResponse, countsResponse] = await Promise.all([
        TemplatesAPI.getMyTemplates(),
        TemplatesAPI.getTemplateCounts()
      ]);
      
      if (myTemplatesResponse.success && myTemplatesResponse.data) {
        setMyTemplates(myTemplatesResponse.data);
      }
      
      if (countsResponse.success && countsResponse.data) {
        setTemplateCounts(countsResponse.data);
      }
    } catch (err) {
      console.error('Failed to refresh my templates:', err);
    }
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateCounts.myTemplates}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateCounts.communityTemplates}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{templateCounts.totalUsage}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                onTemplateAdded={handleTemplateAdded}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </DashboardLayout>
  );
}
