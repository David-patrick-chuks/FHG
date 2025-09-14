'use client';

interface PricingHeroProps {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
}

export function PricingHero({ billingCycle, setBillingCycle }: PricingHeroProps) {
  return (
    <div className="relative text-center mb-16">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
        <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Flexible Pricing Plans</span>
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight px-4">
        Scale Your 
        <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Email Marketing
        </span>
      </h2>
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
        Choose the perfect plan for your business needs. Upgrade anytime to unlock more features and higher limits.
      </p>
      
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-1 flex border border-white/20 dark:border-slate-700/50">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
  );
}
