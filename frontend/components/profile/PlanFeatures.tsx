'use client';

import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { CreditCard } from 'lucide-react';

interface PlanFeaturesProps {
  user: User;
}

export function PlanFeatures({ user }: PlanFeaturesProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {user.subscription === 'ENTERPRISE' ? '∞' : 
             user.subscription === 'PRO' ? '50' : '2'}
          </div>
          <div className="text-sm text-gray-600">Bots</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {user.subscription === 'ENTERPRISE' ? '∞' : 
             user.subscription === 'PRO' ? '5000' : '1000'}
          </div>
          <div className="text-sm text-gray-600">Daily Emails</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {user.subscription === 'ENTERPRISE' ? '∞' : 
             user.subscription === 'PRO' ? '50' : '2'}
          </div>
          <div className="text-sm text-gray-600">Campaigns</div>
        </div>
      </div>

      {user.subscription === 'FREE' && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Get more bots, higher email limits, and advanced features with our Pro or Enterprise plans.
          </p>
          <Button 
            onClick={() => window.open('/pricing', '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View Plans
          </Button>
        </div>
      )}
    </div>
  );
}
