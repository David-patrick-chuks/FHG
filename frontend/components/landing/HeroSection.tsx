'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedSection } from './AnimatedSection';
import { ArrowRight, Brain, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-white/90 text-sm font-medium">✨ AI-Powered Email Marketing</span>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                  Email Marketing
                </span>
                with AI
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={400}>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed">
                Create, automate, and optimize email campaigns with AI technology that delivers results.
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={600}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-10 py-5 h-14 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105">
                      Access Dashboard
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="text-lg px-10 py-5 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                        Get Started Free
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="text-lg px-10 py-5 h-14 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={800}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-white/70">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Free plan available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Upgrade anytime</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
          
          {/* Right Column - Dashboard Screenshot Placeholder */}
          <AnimatedSection delay={1000}>
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl hover:scale-105 transition-transform duration-500">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
                  {/* Placeholder Image */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/20 hover:scale-110 transition-transform duration-300">
                      <Brain className="w-16 h-16 text-white/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">MailQuill Dashboard</h3>
                    <p className="text-white/60 text-sm">Screenshot placeholder</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/30 rounded-full blur-xl animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-cyan-500/30 rounded-full blur-xl animate-bounce delay-1000"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
