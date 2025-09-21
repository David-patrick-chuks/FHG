'use client';

import { EditCampaignError } from '@/components/dashboard/campaigns/EditCampaignError';
import { EditCampaignForm } from '@/components/dashboard/campaigns/EditCampaignForm';
import { EditCampaignHeader } from '@/components/dashboard/campaigns/EditCampaignHeader';
import { EditCampaignSkeleton } from '@/components/dashboard/campaigns/EditCampaignSkeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEditCampaign } from '@/hooks/useEditCampaign';
import { Mail } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditCampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const {
    campaign,
    bot,
    loading,
    saving,
    error,
    formData,
    setFormData,
    handleSubmit,
    handleEmailListChange,
    getStatusColor,
    fetchCampaign
  } = useEditCampaign(campaignId);

  if (loading) {
    return <EditCampaignSkeleton />;
  }

  if (error || !campaign) {
    return <EditCampaignError error={error} onRetry={fetchCampaign} />;
  }

  return (
    <DashboardLayout 
      title="Edit Campaign"
      description={`Edit ${campaign.name}`}
      actions={<EditCampaignHeader campaignName={campaign.name} campaignId={campaign._id} />}
    >
      <div className="space-y-6">
        {/* Campaign Info Card */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-blue-50/50 dark:from-blue-950/10 dark:to-blue-950/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Campaign Information
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Update your campaign details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditCampaignForm
              formData={formData}
              setFormData={setFormData}
              handleEmailListChange={handleEmailListChange}
              handleSubmit={handleSubmit}
              saving={saving}
              bot={bot}
              getStatusColor={getStatusColor}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
