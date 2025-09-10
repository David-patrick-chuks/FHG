'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';

export function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Floating glass elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <AnimatedSection delay={0}>
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
                <span className="hidden sm:inline">Join 10,000+ businesses who switched to MailQuill</span>
                <span className="sm:hidden">10,000+ businesses trust MailQuill</span>
              </span>
            </div>
          </div>
        </AnimatedSection>
        
              <AnimatedSection delay={100}>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight px-4">
                  Ready to send emails that
                  <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    people actually want to read?
                  </span>
                </h2>
              </AnimatedSection>
              
              <AnimatedSection delay={200}>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
                  Stop sending emails that get ignored. Start building real relationships with your audience using MailQuill.
                </p>
              </AnimatedSection>
        
        <AnimatedSection delay={300}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <span className="relative z-10 text-sm sm:text-base">Go to Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <span className="relative z-10 text-sm sm:text-base">Get Started</span>
                     </Button>
                </Link>
              </>
            )}
          </div>
        </AnimatedSection>
        
 
      </div>
    </section>
  );
}
