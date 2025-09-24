import { generatePageMetadata } from '@/lib/seo';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PricingContent } from './PricingContent';

export const metadata: Metadata = generatePageMetadata('pricing');

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pricing page...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
