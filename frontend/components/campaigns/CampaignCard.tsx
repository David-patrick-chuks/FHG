'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Pause, Play, SquarePi } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CampaignCardProps {
  campaign: Campaign;
  botName: string;
  onPause: (campaign: Campaign) => void;
  onResume: (campaign: Campaign) => void;
  onStop: (campaign: Campaign) => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "outline" | "destructive";
  getStatusColor: (status: string) => string;
  viewMode: 'grid' | 'list';
}

export function CampaignCard({
  campaign,
  botName,
  onPause,
  onResume,
  onStop,
  getStatusBadgeVariant,
  getStatusColor,
  viewMode
}: CampaignCardProps) {
  const router = useRouter();

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {campaign.name}
                </h3>
                <Badge 
                  variant={getStatusBadgeVariant(campaign.status)}
                  className={getStatusColor(campaign.status)}
                >
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {campaign.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>Bot: {botName}</span>
                <span>Recipients: {campaign.emailList.length}</span>
                <span>Sent: {campaign.sentEmails.length}</span>
                <span>Created: {campaign.createdAt instanceof Date ? campaign.createdAt.toLocaleDateString() : new Date(campaign.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'running' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPause(campaign)}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStop(campaign)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <SquarePi className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </>
              )}
              {campaign.status === 'paused' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResume(campaign)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStop(campaign)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <SquarePi className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {campaign.name}
              </h3>
              <Badge 
                variant={getStatusBadgeVariant(campaign.status)}
                className={getStatusColor(campaign.status)}
              >
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {campaign.description || 'No description provided'}
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Bot:</span>
              <span className="font-medium">{botName}</span>
            </div>
            <div className="flex justify-between">
              <span>Recipients:</span>
              <span className="font-medium">{campaign.emailList.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sent:</span>
              <span className="font-medium">{campaign.sentEmails.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">{campaign.createdAt instanceof Date ? campaign.createdAt.toLocaleDateString() : new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {campaign.status === 'running' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onPause(campaign)}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onStop(campaign)}
                >
                  <SquarePi className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {campaign.status === 'paused' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onResume(campaign)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onStop(campaign)}
                >
                  <SquarePi className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
