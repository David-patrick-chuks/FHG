'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentAPI, PaymentPricing } from '@/lib/api/payment';
import { Check, CreditCard, Crown, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pricing, setPricing] = useState<PaymentPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');

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
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!pricing) return;

    setProcessing(true);
    try {
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const response = await PaymentAPI.initializePayment({
        subscriptionTier: selectedPlan,
        billingCycle: selectedBilling,
        email: userEmail
      });

      if (response.success && response.data) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorizationUrl;
      } else {
        toast.error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      toast.error('Failed to initialize payment');
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

  const getSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Upgrade Subscription"
        description="Choose a plan that fits your needs"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Upgrade Subscription"
      description="Choose a plan that fits your needs and unlock powerful features"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedBilling === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save up to 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pro Plan */}
          <Card className={`relative ${selectedPlan === 'pro' ? 'ring-2 ring-blue-500' : ''}`}>
            {selectedPlan === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Selected</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Pro Plan</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Perfect for growing businesses
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {pricing ? formatPrice(pricing.pro[selectedBilling]) : 'Loading...'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  per {selectedBilling === 'monthly' ? 'month' : 'year'}
                </div>
                {selectedBilling === 'yearly' && pricing && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Save {formatPrice(getSavings(pricing.pro.monthly, pricing.pro.yearly).amount)} ({getSavings(pricing.pro.monthly, pricing.pro.yearly).percentage}%)
                  </div>
                )}
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>10 Email Bots</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>10 Active Campaigns</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>500 Daily Emails</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Multiple URL Email Extraction</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
              </ul>

              <Button
                onClick={() => setSelectedPlan('pro')}
                variant={selectedPlan === 'pro' ? 'default' : 'outline'}
                className="w-full"
                size="lg"
              >
                {selectedPlan === 'pro' ? 'Selected' : 'Select Pro'}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className={`relative ${selectedPlan === 'enterprise' ? 'ring-2 ring-purple-500' : ''}`}>
            {selectedPlan === 'enterprise' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">Selected</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Enterprise Plan</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                For large-scale operations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {pricing ? formatPrice(pricing.enterprise[selectedBilling]) : 'Loading...'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  per {selectedBilling === 'monthly' ? 'month' : 'year'}
                </div>
                {selectedBilling === 'yearly' && pricing && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Save {formatPrice(getSavings(pricing.enterprise.monthly, pricing.enterprise.yearly).amount)} ({getSavings(pricing.enterprise.monthly, pricing.enterprise.yearly).percentage}%)
                  </div>
                )}
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>50 Email Bots</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>50 Active Campaigns</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>500 Daily Emails</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited URL Email Extraction</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Advanced Analytics & Reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Custom Integrations</span>
                </li>
              </ul>

              <Button
                onClick={() => setSelectedPlan('enterprise')}
                variant={selectedPlan === 'enterprise' ? 'default' : 'outline'}
                className="w-full"
                size="lg"
              >
                {selectedPlan === 'enterprise' ? 'Selected' : 'Select Enterprise'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Button */}
        <div className="text-center">
          <Button
            onClick={handlePayment}
            disabled={processing || !pricing}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay with Paystack
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
