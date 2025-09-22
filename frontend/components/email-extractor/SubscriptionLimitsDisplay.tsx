'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap } from 'lucide-react';
import { SubscriptionInfo } from './types';

interface SubscriptionLimitsDisplayProps {
  subscriptionInfo: SubscriptionInfo | null;
}

export function SubscriptionLimitsDisplay({ subscriptionInfo }: SubscriptionLimitsDisplayProps) {
  if (!subscriptionInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Limits</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { limits, usage } = subscriptionInfo;
  const usagePercentage = limits.isUnlimited ? 0 : (usage.used / usage.limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Daily Usage
          </CardTitle>
          <CardDescription>
            {limits.isUnlimited ? 'Unlimited extractions' : `${usage.used} of ${usage.limit} extractions used today`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!limits.isUnlimited && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(usagePercentage)}%</span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={`w-full ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                  {usage.remaining} extractions
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Resets at {new Date(usage.resetTime).toLocaleTimeString()}
              </div>
            </>
          )}
          
          {limits.isUnlimited && (
            <div className="text-center py-4">
              <div className="text-2xl font-bold text-green-600 mb-2">∞</div>
              <p className="text-sm text-muted-foreground">Unlimited extractions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan: {limits.planName}
          </CardTitle>
          <CardDescription>
            Your current subscription features and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Daily Extractions</span>
              <Badge variant={limits.isUnlimited ? "default" : "default"}>
                {limits.isUnlimited ? 'Unlimited' : limits.dailyExtractionLimit}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">CSV Upload</span>
              <Badge variant={limits.canUseCsvUpload ? "default" : "outline"}>
                {limits.canUseCsvUpload ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </div>

          {subscriptionInfo.needsUpgrade && (
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-3">
                {subscriptionInfo.upgradeRecommendation?.reason || 'Upgrade to unlock more features'}
              </div>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                className="w-full"
                size="sm"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
