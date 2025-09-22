'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

interface Plan {
  name: string;
  price: string;
  priceNaira: string;
  description: string;
  features: string[];
  limitations: string[];
  color: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'FREE',
    price: '$0',
    priceNaira: '₦0',
    description: 'Perfect for getting started',
    features: [
      '2 AI Bots',
      '1,000 Daily Emails',
      '100 Campaigns',
      'Basic Analytics',
      'Email Support'
    ],
    limitations: [
      'Limited bot customization',
      'Basic email templates',
      'Standard analytics'
    ],
    color: 'border-gray-200'
  },
  {
    name: 'PRO',
    price: '$29',
    priceNaira: '₦45,000',
    description: 'For growing businesses',
    features: [
      '50 AI Bots',
      '5,000 Daily Emails',
      '500 Campaigns',
      'Advanced Analytics',
      'Priority Support',
      'Custom Email Templates',
      'API Access',
      'Advanced Bot Customization'
    ],
    limitations: [],
    color: 'border-blue-200',
    popular: true
  },
  {
    name: 'ENTERPRISE',
    price: '$99',
    priceNaira: '₦150,000',
    description: 'For large organizations',
    features: [
      'Unlimited AI Bots',
      'Unlimited Daily Emails',
      'Unlimited Campaigns',
      'Advanced Analytics & Reports',
      '24/7 Priority Support',
      'Custom Integrations',
      'Dedicated Account Manager',
      'White-label Solutions',
      'Custom API Endpoints'
    ],
    limitations: [],
    color: 'border-purple-200'
  }
];

export function PricingModal({ isOpen, onClose, currentPlan }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleUpgrade = (planName: string) => {
    const plan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    if (!plan) return;

    const message = `Hi! I'm interested in upgrading to the ${plan.name} plan (${plan.priceNaira}). Please provide payment details.`;
    const whatsappUrl = `https://wa.me/2347014185686?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            Select the perfect plan for your business needs. All prices are in Nigerian Naira.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.priceNaira}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {plan.price}
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Features
                  </h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Limitations
                    </h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  {currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan.name)}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {plan.name === 'FREE' ? 'Contact Support' : 'Upgrade via WhatsApp'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Need Help Choosing?</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Contact our support team via WhatsApp at +234 701 418 5686 for personalized recommendations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
