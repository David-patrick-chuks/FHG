'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { AlertCircle, Calendar, CheckCircle, CreditCard, Download, Settings, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SubscriptionData {
  tier: string;
  billingCycle: string;
  isActive: boolean;
  expiresAt: string;
  features: string[];
  limits: {
    maxBots: number;
    maxCampaigns: number;
    maxAIMessageVariations: number;
    maxEmailExtractions: number;
  };
}

interface PaymentData {
  _id: string;
  reference: string;
  subscriptionTier: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { get, post } = useApi();

  useEffect(() => {
    fetchSubscriptionData();
    fetchPaymentHistory();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await get('/payments/subscription');
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await get('/payments/history');
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (reference: string) => {
    try {
      const response = await fetch(`/api/payments/receipt/${reference}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Receipt downloaded successfully');
      } else {
        toast.error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await post('/payments/cancel-subscription', {
        reason: 'User requested cancellation'
      });

      if (response.success) {
        toast.success('Subscription cancelled successfully');
        setShowCancelConfirm(false);
        fetchSubscriptionData();
      } else {
        toast.error(response.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/payments')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Payments
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your subscription, view payment history, and download receipts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Subscription */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Current Subscription
                </CardTitle>
                <CardDescription>
                  Your active subscription details and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={`${getTierColor(subscription.tier)} text-sm font-semibold`}>
                          {subscription.tier.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          {subscription.billingCycle} billing
                        </p>
                      </div>
                      <div className="text-right">
                        {subscription.isActive ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Inactive</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {subscription.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {formatDate(subscription.expiresAt)}</span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Plan Features</h4>
                      <ul className="space-y-1">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">Usage Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bots:</span>
                          <span className="font-medium">{subscription.limits.maxBots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Campaigns:</span>
                          <span className="font-medium">{subscription.limits.maxCampaigns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">AI Variations:</span>
                          <span className="font-medium">{subscription.limits.maxAIMessageVariations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email Extractions:</span>
                          <span className="font-medium">
                            {subscription.limits.maxEmailExtractions === 999999 ? 'Unlimited' : subscription.limits.maxEmailExtractions}
                          </span>
                        </div>
                      </div>
                    </div>

                    {subscription.tier !== 'free' && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No subscription data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Your recent payment transactions and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getTierColor(payment.subscriptionTier)} text-xs`}>
                              {payment.subscriptionTier.toUpperCase()}
                            </Badge>
                            <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.createdAt)} • {payment.reference}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.reference)}
                          className="ml-4"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    ))}
                    {payments.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.push('/dashboard/payments')}
                      >
                        View All Payments
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md bg-white">
                <CardHeader>
                  <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
                  <CardDescription>
                    Are you sure you want to cancel your subscription? This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cancelling will downgrade you to the free plan immediately. You'll lose access to premium features.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                    >
                      {cancelling && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
