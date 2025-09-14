'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PaymentAPI, PaymentPricing } from '@/lib/api/payment';
import { Building, Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PricingCard } from './PricingCard';
import { PricingFAQ } from './PricingFAQ';
import { PricingHero } from './PricingHero';

export function PricingPageContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [pricing, setPricing] = useState<PaymentPricing | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await PaymentAPI.getPricing();
      if (response.success && response.data) {
        setPricing(response.data);
      } else {
        toast.error('Failed to load pricing information');
      }
    } catch (error) {
      toast.error('Failed to load pricing information');
    }
  };

  const handlePayment = async (plan: 'basic' | 'premium') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue with payment');
      router.push('/login?redirect=/pricing');
      return;
    }

    if (!pricing) return;

    setSelectedPlan(plan);
    setProcessing(true);
    try {
      const userEmail = user?.email || '';
      
      const response = await PaymentAPI.initializePayment({
        subscriptionTier: plan,
        billingCycle: billingCycle,
        email: userEmail
      });

      if (response.success && response.data) {
        window.location.href = response.data.authorizationUrl;
      } else {
        toast.error(response.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      if (error.message?.includes('Access token required') || error.message?.includes('401')) {
        toast.error('Authentication expired. Please sign in again.');
        router.push('/signin?redirect=/pricing');
      } else {
        toast.error('Failed to initialize payment');
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const plans = [
    {
      name: 'FREE',
      description: 'Perfect for getting started',
      icon: Zap,
      features: [
        '2 Bots',
        '1,000 Daily Emails',
        '2 Campaigns',
        '10 Email Extractions/day',
        'Analytics',
        'Customer Support'
      ],
      price: '₦0 / $0',
      isCurrent: true,
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const,
      buttonClassName: 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400',
      iconClassName: 'bg-gradient-to-br from-slate-500/20 to-slate-600/20',
      borderClassName: 'border-white/20 dark:border-slate-700/50',
      shadowClassName: 'shadow-slate-900/5'
    },
    {
      name: 'BASIC',
      description: 'For growing businesses',
      icon: Crown,
      features: [
        '10 Bots',
        '10,000 Daily Emails',
        '10 Campaigns',
        '50 Email Extractions/day',
        'CSV Upload Support',
        'Advanced Email Extraction',
        'Analytics',
        'Priority Support'
      ],
      price: pricing ? formatPrice(pricing.basic[billingCycle]) : '₦2,999 / $1.99',
      isPopular: true,
      buttonText: isAuthenticated ? 'Upgrade to BASIC' : 'Sign in to Upgrade',
      buttonClassName: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200',
      iconClassName: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      borderClassName: 'border-2 border-cyan-500/30 dark:border-cyan-400/30',
      shadowClassName: 'shadow-cyan-500/10'
    },
    {
      name: 'PREMIUM',
      description: 'For large organizations',
      icon: Building,
      features: [
        '50 Bots',
        '50,000 Daily Emails',
        '50 Campaigns',
        'Unlimited Email Extractions',
        'CSV Upload Support',
        'Advanced Email Extraction',
        'API Access',
        'Custom Integrations',
        'Analytics',
        'Dedicated Support'
      ],
      price: pricing ? formatPrice(pricing.premium[billingCycle]) : '₦14,999 / $9.95',
      buttonText: isAuthenticated ? 'Upgrade to PREMIUM' : 'Sign in to Upgrade',
      buttonClassName: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200',
      iconClassName: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      borderClassName: 'border-white/20 dark:border-slate-700/50',
      shadowClassName: 'shadow-slate-900/5'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(6,182,212,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
        </div>
        
        {/* Floating glass elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        </div>

        <PricingHero billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

        <div className="relative grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              billingCycle={billingCycle}
              onButtonClick={plan.name === 'FREE' ? undefined : () => handlePayment(plan.name.toLowerCase() as 'basic' | 'premium')}
              isProcessing={processing && selectedPlan === plan.name.toLowerCase()}
              isDisabled={plan.name === 'FREE' || !pricing}
            />
          ))}
        </div>

        <PricingFAQ />
      </main>
    </div>
  );
}
