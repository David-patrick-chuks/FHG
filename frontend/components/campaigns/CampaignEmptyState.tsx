'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Plus } from 'lucide-react';

interface CampaignEmptyStateProps {
  searchQuery: string;
  statusFilter: string;
  botsLoading: boolean;
  botsLength: number;
  onCreateCampaign: () => void;
  onCreateBot: () => void;
}

export function CampaignEmptyState({
  searchQuery,
  statusFilter,
  botsLoading,
  botsLength,
  onCreateCampaign,
  onCreateBot
}: CampaignEmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : !botsLoading && botsLength === 0
              ? 'You need to create a bot first before you can create email campaigns.'
              : 'Get started by creating your first email campaign.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <div className="space-y-3">
              {!botsLoading && botsLength === 0 ? (
                <Button 
                  onClick={onCreateBot}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bot
                </Button>
              ) : (
                <Button 
                  onClick={onCreateCampaign}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
