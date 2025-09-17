'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AnalyticsErrorState({ error, onRetry }: AnalyticsErrorStateProps) {
  const isSubscriptionError = error.toLowerCase().includes('subscription') || 
                             error.toLowerCase().includes('upgrade') ||
                             error.toLowerCase().includes('paid');

  return (
    <div className="space-y-6">
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                {isSubscriptionError ? 'Subscription Required' : 'Error'}
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {error}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isSubscriptionError ? (
                <Link href="/dashboard/payments">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Upgrade Subscription
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={onRetry} 
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
