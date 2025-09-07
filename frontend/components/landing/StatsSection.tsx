'use client';

import { stats } from '@/data/landing-page-content';
import { AnimatedSection } from './AnimatedSection';
import { Counter } from './Counter';

export function StatsSection() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white/90 text-sm font-medium">📊 Trusted by Industry Leaders</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedSection key={index} delay={index * 150}>
              <div className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <Counter 
                    end={stat.end} 
                    suffix={stat.suffix} 
                    duration={stat.duration} 
                    gradient={stat.gradient} 
                  />
                  <div className="text-white/70 font-medium text-lg">{stat.label}</div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
