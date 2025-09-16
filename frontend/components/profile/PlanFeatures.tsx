'use client';

import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { CreditCard } from 'lucide-react';

interface PlanFeaturesProps {
  user: User;
}

export function PlanFeatures({ user }: PlanFeaturesProps) {
  // Get plan limits based on subscription tier
  const getPlanLimits = (subscription: string) => {
    const plan = subscription.toLowerCase();
    switch (plan) {
      case 'enterprise':
        return { bots: '∞', emails: '∞', campaigns: '∞' };
      case 'premium':
        return { bots: '50', emails: '50,000', campaigns: '50' };
      case 'basic':
        return { bots: '10', emails: '10,000', campaigns: '10' };
      case 'free':
      default:
        return { bots: '2', emails: '1,000', campaigns: '2' };
    }
  };

  const limits = getPlanLimits(user.subscription);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {limits.bots}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Bots</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {limits.emails}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Daily Emails</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {limits.campaigns}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Campaigns</div>
        </div>
      </div>

      {(user.subscription.toLowerCase() === 'free' || user.subscription.toLowerCase() === 'basic') && (
        <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
            {user.subscription.toLowerCase() === 'free' ? 'Upgrade Your Plan' : 'Upgrade to Premium'}
          </h3>
          <p className="text-cyan-700 dark:text-cyan-300 mb-4">
            {user.subscription.toLowerCase() === 'free' 
              ? 'Get more bots, higher email limits, and advanced features with our Basic or Premium plans.'
              : 'Unlock unlimited potential with our Premium plan - 50 bots, 50,000 daily emails, and 50 campaigns.'
            }
          </p>
          <Button     
            onClick={() => window.open('/pricing', '_blank')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </div>
      )}
    </div>
  );
}
