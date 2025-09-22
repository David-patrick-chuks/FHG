'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Loader2, LucideIcon } from 'lucide-react';

interface PricingCardProps {
  plan: {
    name: string;
    description: string;
    icon: LucideIcon;
    features: string[];
    price: string;
    isPopular?: boolean;
    isCurrent?: boolean;
    buttonText: string;
    buttonVariant?: 'default' | 'outline';
    buttonClassName?: string;
    iconClassName?: string;
    borderClassName?: string;
    shadowClassName?: string;
  };
  billingCycle: 'monthly' | 'yearly';
  onButtonClick?: () => void;
  isProcessing?: boolean;
  isDisabled?: boolean;
}

export function PricingCard({ 
  plan, 
  billingCycle, 
  onButtonClick, 
  isProcessing = false, 
  isDisabled = false 
}: PricingCardProps) {
  const Icon = plan.icon;

  return (
    <div className="group relative">
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1 shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}
      <div className={`absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border ${plan.borderClassName || 'border-white/20 dark:border-slate-700/50'} shadow-lg ${plan.shadowClassName || 'shadow-slate-900/5'} group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300`}></div>
      <div className="relative p-6 h-full">
        <div className="text-center pb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 ${plan.iconClassName || 'bg-gradient-to-br from-slate-500/20 to-slate-600/20'} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <Icon className={`w-6 h-6 ${plan.iconClassName?.includes('cyan') ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'}`} />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-4">
            {plan.description}
          </p>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {plan.price}
            <span className="text-lg font-normal text-slate-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
          </div>
        </div>
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-5 h-5 text-cyan-500 mr-3" />
              <span className="text-slate-600 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          variant={plan.buttonVariant || 'default'}
          className={`w-full ${plan.buttonClassName || ''}`}
          onClick={onButtonClick}
          disabled={isDisabled || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {plan.buttonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
