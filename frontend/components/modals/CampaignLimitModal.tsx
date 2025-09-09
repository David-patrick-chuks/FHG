'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building, Crown, ExternalLink, Mail, Zap } from 'lucide-react';
import Link from 'next/link';

interface CampaignLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentCampaigns: number;
  maxCampaigns: number;
}

export function CampaignLimitModal({ 
  isOpen, 
  onClose, 
  currentPlan, 
  currentCampaigns, 
  maxCampaigns 
}: CampaignLimitModalProps) {
  const planFeatures = {
    FREE: {
      campaigns: 2,
      dailyEmails: 1000,
      bots: 2,
      icon: Zap,
      color: 'gray'
    },
    PRO: {
      campaigns: 10,
      dailyEmails: 10000,
      bots: 10,
      icon: Crown,
      color: 'blue'
    },
    ENTERPRISE: {
      campaigns: 50,
      dailyEmails: 50000,
      bots: 50,
      icon: Building,
      color: 'purple'
    }
  };

  const currentFeatures = planFeatures[currentPlan];
  const IconComponent = currentFeatures.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Campaign Limit Reached 📧
          </DialogTitle>
          <DialogDescription className="text-center text-base sm:text-lg">
            You've reached the maximum number of campaigns for your current plan
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.campaigns}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Campaigns
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {currentCampaigns}/{maxCampaigns} used
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.dailyEmails.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Daily Emails
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {currentFeatures.bots}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Bots
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
              Unlock more campaigns and advanced features to scale your email marketing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 w-full sm:w-auto"
              >
                Maybe Later
              </Button>
              <Button asChild className="px-6 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Link href="/payment" className="flex items-center justify-center gap-2">
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
                    Get 10 campaigns, 10,000 daily emails, and 10 bots for just ₦2,999/$1.99/month
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
