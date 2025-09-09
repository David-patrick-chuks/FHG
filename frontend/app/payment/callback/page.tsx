'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentAPI } from '@/lib/api/payment';
import { ArrowRight, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { toast } from 'sonner';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    const paymentRef = reference || trxref;
    if (paymentRef) {
      verifyPayment(paymentRef);
    } else {
      setStatus('failed');
      setMessage('No payment reference found');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await PaymentAPI.verifyPayment(reference);
      
      if (response.success) {
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        toast.success('Payment successful! Your subscription has been activated.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(response.message || 'Payment verification failed');
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('Failed to verify payment');
      toast.error('Failed to verify payment');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'failed':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  return (
    <DashboardLayout
      title="Payment Status"
      description="Processing your payment..."
    >
      <div className="max-w-2xl mx-auto">
        <Card className={`${getStatusColor()} transition-all duration-300`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Processing Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {message}
            </p>

            {status === 'loading' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we verify your payment...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You will be redirected to your dashboard shortly.
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you believe this is an error, please contact support.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/payment')}
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <DashboardLayout
        title="Payment Status"
        description="Loading..."
      >
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Please wait while we load the payment status...
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
