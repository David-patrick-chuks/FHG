'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle,
  Shield,
  Star,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: 'Intelligent Content Generation',
    description: 'Leverage cutting-edge AI to craft compelling, personalized email content that resonates with your audience and drives engagement.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Bot,
    title: 'Automated Campaign Management',
    description: 'Deploy sophisticated email automation that intelligently schedules and delivers campaigns for optimal performance and engagement.',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: Target,
    title: 'Precision Audience Targeting',
    description: 'Utilize advanced segmentation tools to deliver highly targeted campaigns that maximize conversion rates and ROI.',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Analytics',
    description: 'Gain deep insights into campaign performance with detailed analytics and actionable intelligence to optimize your strategy.',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Zap,
    title: 'Smart Workflow Automation',
    description: 'Build sophisticated email sequences that automatically nurture prospects and convert leads without manual intervention.',
    color: 'text-indigo-600 bg-indigo-900/20',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Protect your data with bank-level security protocols and SOC 2 compliance, ensuring complete peace of mind.',
    color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses getting started with email marketing',
    features: [
      'Up to 5,000 emails/month',
      '3 email bots',
      'Basic templates',
      'Email support',
      'Basic analytics',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'Ideal for growing businesses with advanced email marketing needs',
    features: [
      'Up to 25,000 emails/month',
      '10 email bots',
      'AI content generation',
      'Advanced segmentation',
      'Priority support',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom requirements',
    features: [
      'Unlimited emails',
      'Unlimited bots',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom reporting',
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechFlow Inc.',
    content: 'MailQuill revolutionized our email marketing strategy. The intelligent content generation increased our open rates by 40% while automation saved us 15 hours weekly.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'GrowthStart',
    content: 'MailQuill\'s advanced automation and precision targeting helped us scale from 1,000 to 50,000 engaged subscribers in just 6 months.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'E-commerce Manager',
    company: 'StyleHub',
    content: 'The platform\'s intuitive design and powerful automation features improved our conversion rates by 25% while freeing us to focus on strategic initiatives.',
    rating: 5,
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium">
              ✨ Enterprise-Grade Email Marketing Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Transform Your
              <span className="text-blue-600 dark:text-blue-400 block">Email Marketing</span>
              with Intelligence
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              MailQuill empowers businesses to create, automate, and optimize email campaigns with cutting-edge AI technology, delivering measurable results and exceptional ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-10 py-5 h-14">
                    Access Dashboard
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-10 py-5 h-14">
                      Start Free Trial
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-10 py-5 h-14 border-2">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Enterprise-Grade Email Marketing Solutions
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools and intelligent automation to elevate your email marketing strategy and drive exceptional business results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl font-semibold leading-tight">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10M+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Emails Sent</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                98.5%
              </div>
              <div className="text-gray-600 dark:text-gray-300">Deliverability Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                45%
              </div>
              <div className="text-gray-600 dark:text-gray-300">Avg Open Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by marketers worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our customers have to say about FHG AI Bot
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your email marketing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of marketers who are already using AI to boost their email campaigns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FHG AI Bot</span>
              </div>
              <p className="text-gray-400">
                The intelligent email marketing platform that helps you create, automate, and optimize your campaigns.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FHG AI Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
