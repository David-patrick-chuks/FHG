'use client';

import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export function PricingHeader() {
  return (
    <header className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Choose Your Plan
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Unlock the full potential of your email marketing campaigns
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <Zap className="w-4 h-4" />
            Upgrade Now
          </Badge>
        </div>
      </div>
    </header>
  );
}
