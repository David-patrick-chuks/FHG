'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentsLoadingSkeleton } from '@/components/payments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentAPI, PaymentHistory, PaymentHistoryFilters, PaymentHistoryResponse } from '@/lib/api/payment';
import {
    CheckCircle,
    Clock,
    CreditCard,
    Crown,
    Download,
    Search,
    Settings,
    XCircle,
    Zap,
    ChevronLeft,
    ChevronRight,
    Filter,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function UserPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [canUpgrade, setCanUpgrade] = useState(true);

  useEffect(() => {
    fetchPayments();
    checkUpgradeEligibility();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await PaymentAPI.getPaymentHistory();
      
      if (response.success && response.data) {
        setPayments(response.data);
      } else {
        toast.error('Failed to load payment history');
      }
    } catch (error) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const checkUpgradeEligibility = async () => {
    try {
      const response = await PaymentAPI.canUpgrade();
      if (response.success && response.data) {
        setCanUpgrade(response.data.canUpgrade);
      }
    } catch (error) {
      console.error('Error checking upgrade eligibility:', error);
      // Default to showing upgrade banner if API fails
      setCanUpgrade(true);
    }
  };

  const handleDownloadReceipt = async (reference: string) => {
    try {
      await PaymentAPI.downloadReceipt(reference);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'enterprise':
        return <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Payment History"
        description="View your payment transactions and subscription history"
      >
        <PaymentsLoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Payment History"
      description="View your payment transactions and subscription history"
      // actions={
      //   <Button
      //     variant="outline"
      //     onClick={() => router.push('/dashboard/payments/subscription')}
      //     className="flex items-center gap-2"
      //   >
      //     <Settings className="h-4 w-4" />
      //     Manage Subscription
      //   </Button>
      // }
    >
      <div className="space-y-6">
        {/* Upgrade Section - Only show if user can upgrade */}
        {canUpgrade && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Need to upgrade your plan?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Access more features and higher limits with our premium plans.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment List */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        {getPlanIcon(payment.subscriptionTier)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.subscriptionTier.toUpperCase()} - {payment.billingCycle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reference: {payment.reference}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(payment.createdAt)}
                        </p>
                        {payment.paidAt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Paid: {formatDate(payment.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(payment.amount)}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(payment.status)}
                      </div>
                      {payment.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleDownloadReceipt(payment.reference)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No payment history</p>
                <p className="text-sm mb-4">You haven't made any payments yet.</p>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Your Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      
      </div>
    </DashboardLayout>
  );
}