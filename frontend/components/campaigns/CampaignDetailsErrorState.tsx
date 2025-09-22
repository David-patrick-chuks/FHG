'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CampaignDetailsErrorStateProps {
  error: string | null;
  onRetry?: () => void;
}

export function CampaignDetailsErrorState({ error, onRetry }: CampaignDetailsErrorStateProps) {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Campaign Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'The campaign you are looking for does not exist or has been deleted.'}
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={() => router.push('/dashboard/campaigns')}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Campaigns
                </Button>
                {error && onRetry && (
                  <Button 
                    onClick={onRetry}
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
