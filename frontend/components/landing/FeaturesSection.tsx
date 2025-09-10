'use client';

import { features } from '@/data/landing-page-content';
import { AnimatedSection } from './AnimatedSection';

export function FeaturesSection() {
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
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">What makes MailQuill different</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Stop struggling with   <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
             boring{" "}
            </span>
            <span className=" text-slate-900 dark:text-white ">
               email tools
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Finally, an email platform that actually helps you connect with your audience instead of annoying them.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="group relative">
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-tight">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
