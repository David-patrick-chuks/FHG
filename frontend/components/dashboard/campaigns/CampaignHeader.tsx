'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Edit, Pause, Play, Trash2 } from 'lucide-react';

interface CampaignHeaderProps {
  campaign: Campaign;
  isUpdating: boolean;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  onEdit: () => void;
  getStatusBadgeVariant: (status: string) => any;
  getStatusColor: (status: string) => string;
}

export function CampaignHeader({
  campaign,
  isUpdating,
  onPause,
  onResume,
  onDelete,
  onEdit,
  getStatusBadgeVariant,
  getStatusColor
}: CampaignHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <Badge 
                variant={getStatusBadgeVariant(campaign.status)}
                className={getStatusColor(campaign.status)}
              >
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="text-base">
              {campaign.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {campaign.status === 'running' && (
              <Button
                variant="outline"
                onClick={onPause}
                disabled={isUpdating}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button
                variant="outline"
                onClick={onResume}
                disabled={isUpdating}
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onEdit}
              disabled={isUpdating}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
