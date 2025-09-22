'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'basic' | 'premium') => void;
  currentPlan: string;
  feature: string;
  reason?: string;
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  onUpgrade,
  currentPlan,
  feature,
  reason
}: UpgradePlanModalProps) {
  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        '50 URLs per day',
        'CSV upload support',
        'Advanced email extraction',
        'Priority support',
        'Export to multiple formats'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited URLs per day',
        'CSV upload support',
        'Advanced email extraction',
        'Dedicated support',
        'Custom integrations',
        'API access',
        'White-label options'
      ],
      popular: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Unlock {feature}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {reason || `Your current ${currentPlan} plan doesn't include ${feature}. Upgrade now to access this feature and more!`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onUpgrade(plan.id as 'basic' | 'premium')}
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white border-0`}
                >
                  Upgrade to {plan.name}
                </Button>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            All plans include a 14-day free trial. Cancel anytime.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
