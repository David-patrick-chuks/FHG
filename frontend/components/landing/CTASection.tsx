'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedSection } from './AnimatedSection';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl">
          <AnimatedSection delay={0}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent block">
                Email Marketing?
              </span>
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join industry leaders who trust MailQuill to deliver exceptional email marketing results.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={400}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-12 py-6 h-16 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105">
                    Access Dashboard
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-12 py-6 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
                      Get Started Free
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-lg px-12 py-6 h-16 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
