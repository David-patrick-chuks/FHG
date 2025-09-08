'use client';

import { Campaign } from '@/types';
import { CampaignCard } from './CampaignCard';

interface CampaignListProps {
  campaigns: Campaign[];
  getBotName: (botId: string) => string;
  onPause: (campaign: Campaign) => void;
  onResume: (campaign: Campaign) => void;
  onStop: (campaign: Campaign) => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "outline" | "destructive";
  getStatusColor: (status: string) => string;
  viewMode: 'grid' | 'list';
}

export function CampaignList({
  campaigns,
  getBotName,
  onPause,
  onResume,
  onStop,
  getStatusBadgeVariant,
  getStatusColor,
  viewMode
}: CampaignListProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            botName={getBotName(campaign.botId)}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getStatusColor={getStatusColor}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign._id}
          campaign={campaign}
          botName={getBotName(campaign.botId)}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          getStatusBadgeVariant={getStatusBadgeVariant}
          getStatusColor={getStatusColor}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
