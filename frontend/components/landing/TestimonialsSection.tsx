'use client';

import { testimonials } from '@/data/landing-page-content';
import { AnimatedSection } from './AnimatedSection';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white/90 text-sm font-medium">💬 Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Trusted by
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            See how MailQuill is transforming email marketing for businesses worldwide
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 200}>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-white/80 mb-8 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="border-t border-white/20 pt-6">
                    <div className="font-semibold text-white text-lg mb-1">
                      {testimonial.name}
                    </div>
                    <div className="text-white/60">
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
