'use client';

import { testimonials } from '@/data/landing-page-content';
import { AnimatedSection } from './AnimatedSection';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Floating glass elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Real stories from real people</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Loved by 
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              real businesses
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Here's what actual customers are saying about their experience with MailQuill
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 200}>
              <div className="group relative">
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-blue-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">Verified customer</span>
                  </div>
                  <blockquote className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
