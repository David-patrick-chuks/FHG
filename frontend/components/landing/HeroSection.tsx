
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center">
          {/* Hero Text Content - Centered */}
          <div className="text-center mb-8">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                <span className="text-white/90 text-xs font-medium uppercase tracking-wide">✨ AI-Powered Email Marketing</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Transform Your
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Email Marketing</span> with AI
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <p className="text-base md:text-lg text-white/80 mb-6 max-w-xl leading-relaxed">
                Create, automate, and optimize email campaigns with AI technology that delivers results.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={600}>
              <div className="flex justify-center mb-6">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="text-base px-8 py-3 h-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
                    >
                      Access Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="text-base px-8 py-3 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Dashboard Screenshot - Centered Below */}
          <AnimatedSection delay={1000}>
            <div className="relative max-w-4xl w-full mt-8">
              <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <img
                      src="/dashboard.png"
                      alt="MailQuill Dashboard"
                      className="w-full h-full object-cover rounded-lg shadow-2xl border border-white/10"
                    />
                    <div className="absolute inset-0 rounded-lg border border-white/20 shadow-inner"></div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-500/30 rounded-full blur-xl animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-cyan-500/30 rounded-full blur-xl animate-bounce delay-1000"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}