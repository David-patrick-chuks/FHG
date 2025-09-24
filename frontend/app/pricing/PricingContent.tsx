'use client';

import { PricingHeader, PricingPageContent } from '@/components/pricing';
import { PaymentAPI } from '@/lib/api/payment';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    handlePaymentCallback();
    setLoading(false);
  }, []);

  const handlePaymentCallback = async () => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');
    
    if (reference && status) {
      try {
        setProcessing(true);
        const response = await PaymentAPI.verifyPayment(reference);
        
        if (response.success) {
          toast.success('Payment successful! Your subscription has been activated.');
          // Redirect to dashboard after successful payment
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          toast.error(response.message || 'Payment verification failed');
        }
      } catch (error) {
        toast.error('Payment verification failed');
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PricingHeader />
      <PricingPageContent />
    </div>
  );
}
