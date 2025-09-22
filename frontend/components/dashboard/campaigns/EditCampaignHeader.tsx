'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditCampaignHeaderProps {
  campaignName: string;
  campaignId: string;
}

export function EditCampaignHeader({ campaignName, campaignId }: EditCampaignHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
        variant="outline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Campaign
      </Button>
    </div>
  );
}
