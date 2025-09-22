'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    BarChart3,
    Bot,
    CheckCircle,
    FileText,
    Mail,
    Target,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Email Bots',
      description: 'Create intelligent email bots that can send personalized messages automatically using AI-generated content.',
      benefits: [
        'Automated email sending',
        'AI message generation',
        'Personalized content',
        'Queue-based processing'
      ]
    },
    {
      icon: Mail,
      title: 'Email Campaign Management',
      description: 'Design and launch email marketing campaigns with our campaign builder and management tools.',
      benefits: [
        'Campaign creation & scheduling',
        'Template-based campaigns',
        'Campaign status tracking',
        'Bulk email processing'
      ]
    },
    {
      icon: Target,
      title: 'Email Extraction & Discovery',
      description: 'Find and extract email addresses from websites with our powerful extraction tools.',
      benefits: [
        'Website email extraction',
        'CSV file processing',
        'Bulk extraction tools',
        'Real-time progress tracking'
      ]
    },
    {
      icon: FileText,
      title: 'Email Templates',
      description: 'Create and manage email templates with dynamic variables for personalized messaging.',
      benefits: [
        'Template creation & editing',
        'Variable-based personalization',
        'Community template sharing',
        'Template approval system'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics & Tracking',
      description: 'Track your email performance with detailed analytics and engagement metrics.',
      benefits: [
        'Campaign performance metrics',
        'Email open tracking',
        'Activity monitoring',
        'Usage statistics'
      ]
    },
    {
      icon: Zap,
      title: 'AI Message Generation',
      description: 'Generate unique, personalized email content using advanced AI technology.',
      benefits: [
        'AI-powered content creation',
        'Template-based variations',
        'Personalized messaging',
        'Automated content generation'
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Powerful Features
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Everything you need to scale your email marketing
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
              <Zap className="w-4 h-4" />
              All Features Included
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(6,182,212,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
        </div>
        
        {/* Floating glass elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* Hero Section */}
        <div className="relative text-center mb-20">
          
           <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Comprehensive Email Automation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight px-4">
            Powerful 
            <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Email Automation Features
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            MailQuill provides a comprehensive suite of tools to help you extract emails, create campaigns, and automate your email marketing with AI-powered bots.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
                <div className="relative p-6 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-cyan-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-600 rounded-3xl shadow-2xl shadow-cyan-500/25"></div>
          <div className="relative p-12 text-white">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-cyan-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Join thousands of businesses already using MailQuill to automate their email marketing and extract valuable contacts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-white text-cyan-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3 text-lg font-semibold backdrop-blur-sm transition-all duration-200"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
