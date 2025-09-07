'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    BarChart3,
    Bot,
    CheckCircle,
    Clock,
    FileText,
    Globe,
    Shield,
    Target,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Email Bots',
      description: 'Create intelligent email bots that can send personalized messages, follow up automatically, and engage with your audience 24/7.',
      benefits: [
        'Automated email sequences',
        'Personalized messaging',
        'Smart follow-ups',
        'Multi-language support'
      ]
    },
    {
      icon: Mail,
      title: 'Advanced Email Campaigns',
      description: 'Design and launch sophisticated email marketing campaigns with our intuitive campaign builder and management tools.',
      benefits: [
        'Drag-and-drop campaign builder',
        'A/B testing capabilities',
        'Scheduled sending',
        'Campaign templates'
      ]
    },
    {
      icon: Target,
      title: 'Email Extraction & Discovery',
      description: 'Find and extract email addresses from websites, social media, and other sources with our powerful extraction tools.',
      benefits: [
        'Website email extraction',
        'Social media discovery',
        'CSV file processing',
        'Bulk extraction tools'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your email performance with detailed analytics, open rates, click-through rates, and engagement metrics.',
      benefits: [
        'Real-time analytics',
        'Performance dashboards',
        'Engagement tracking',
        'ROI measurement'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with GDPR compliance, data encryption, and secure email delivery to protect your business.',
      benefits: [
        'GDPR compliant',
        'Data encryption',
        'Secure delivery',
        'Privacy protection'
      ]
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team using shared campaigns, role-based permissions, and collaborative tools.',
      benefits: [
        'Team workspaces',
        'Role-based access',
        'Shared campaigns',
        'Collaboration tools'
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Powerful Features
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything you need to scale your email marketing
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              All Features Included
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            MailQuill provides a comprehensive suite of tools to help you build, manage, and scale your email marketing campaigns with ease.
          </p>
        </div>


        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              And Much More...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Additional features that make MailQuill the complete email marketing solution
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Round-the-clock customer support</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Global Reach</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send emails worldwide with high deliverability</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Rich Templates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Professional email templates for every need</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimized for speed and performance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using MailQuill to scale their email marketing campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
