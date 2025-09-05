'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building, Crown, ExternalLink, Zap } from 'lucide-react';
import Link from 'next/link';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentBots: number;
  maxBots: number;
}

export function PlanLimitModal({ 
  isOpen, 
  onClose, 
  currentPlan, 
  currentBots, 
  maxBots 
}: PlanLimitModalProps) {
  const planFeatures = {
    FREE: {
      bots: 2,
      dailyEmails: 1000,
      campaigns: 2,
      icon: Zap,
      color: 'gray'
    },
    PRO: {
      bots: 10,
      dailyEmails: 10000,
      campaigns: 10,
      icon: Crown,
      color: 'blue'
    },
    ENTERPRISE: {
      bots: 50,
      dailyEmails: 50000,
      campaigns: 50,
      icon: Building,
      color: 'purple'
    }
  };

  const currentFeatures = planFeatures[currentPlan];
  const IconComponent = currentFeatures.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Plan Limit Reached
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            You've reached the maximum number of bots for your current plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Display */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentFeatures.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                    currentFeatures.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      currentFeatures.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                      currentFeatures.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentPlan} Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your current plan limits and capabilities
                </p>
                
                {/* Plan Features */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.bots}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Bots
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {currentBots}/{maxBots} used
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.dailyEmails.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Daily Emails
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.campaigns}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Campaigns
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Options */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upgrade Your Plan
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unlock more bots and advanced features to scale your email marketing
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Maybe Later
              </Button>
              <Button asChild className="px-6 bg-blue-600 hover:bg-blue-700">
                <Link href="/pricing" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Comparison */}
          {currentPlan === 'FREE' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                    PRO Plan Benefits
                  </h5>
                                     <p className="text-sm text-blue-800 dark:text-blue-200">
                     Get 10 bots, 10,000 daily emails, and 10 campaigns for just ₦45,000/$29/month
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
