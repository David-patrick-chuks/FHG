'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Check, Crown, Zap } from 'lucide-react';
import { useState } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
           
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Choose Your Plan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Unlock the full potential of your email marketing campaigns
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Upgrade Now
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Scale Your Email Marketing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your business needs. Upgrade anytime to unlock more features and higher limits.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FREE Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">FREE</CardTitle>
              <CardDescription className="text-lg">
                Perfect for getting started
              </CardDescription>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                ₦0 / $0<span className="text-lg font-normal text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>2 Bots</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>1,000 Daily Emails</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>2 Campaigns</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 Email Extractions/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Customer Support</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* PRO Plan */}
          <Card className="relative border-blue-500 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">PRO</CardTitle>
              <CardDescription className="text-lg">
                For growing businesses
              </CardDescription>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                {billingCycle === 'yearly' ? (
                  <>
                    ₦28,790 / $19.09<span className="text-lg font-normal text-gray-500">/year</span>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save ₦7,200 / $4.77 (20% off)
                    </div>
                  </>
                ) : (
                  <>
                    ₦2,999 / $1.99<span className="text-lg font-normal text-gray-500">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 Bots</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10,000 Daily Emails</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 Campaigns</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>50 Email Extractions/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>CSV Upload Support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced Email Extraction</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority Support</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const price = billingCycle === 'yearly' ? '₦28,790/$19.09 per year' : '₦2,999/$1.99 per month';
                  const message = encodeURIComponent(`Hi! I want to subscribe to the PRO plan for ${price}. Please help me with the subscription process.`);
                  const whatsappUrl = `https://wa.me/2347014185686?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                Upgrade to PRO
              </Button>
            </CardContent>
          </Card>

          {/* ENTERPRISE Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">ENTERPRISE</CardTitle>
              <CardDescription className="text-lg">
                For large organizations
              </CardDescription>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                {billingCycle === 'yearly' ? (
                  <>
                    ₦143,990 / $95.48<span className="text-lg font-normal text-gray-500">/year</span>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save ₦36,000 / $23.87 (20% off)
                    </div>
                  </>
                ) : (
                  <>
                    ₦14,999 / $9.95<span className="text-lg font-normal text-gray-500">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>50 Bots</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>50,000 Daily Emails</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>50 Campaigns</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited Email Extractions</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>CSV Upload Support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced Email Extraction</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>API Access</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom Integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dedicated Support</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  const price = billingCycle === 'yearly' ? '₦143,990/$95.48 per year' : '₦14,999/$9.95 per month';
                  const message = encodeURIComponent(`Hi! I want to subscribe to the ENTERPRISE plan for ${price}. Please help me with the subscription process.`);
                  const whatsappUrl = `https://wa.me/2347014185686?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                Upgrade to ENTERPRISE
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade or downgrade anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens to my data when I upgrade?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                All your data, bots, and campaigns are preserved when you upgrade. You'll immediately get access to the new plan's features and limits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can start with our FREE plan and upgrade when you're ready. No credit card required to get started.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
