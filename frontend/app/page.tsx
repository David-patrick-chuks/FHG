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
    title: 'AI-Powered Content',
    description: 'Generate personalized email content using advanced AI that understands your audience and brand voice.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Bot,
    title: 'Smart Email Bots',
    description: 'Configure intelligent email bots that automatically send campaigns at optimal times for maximum engagement.',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: Target,
    title: 'Audience Segmentation',
    description: 'Segment your audience with advanced filters and deliver targeted campaigns that convert.',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track campaign performance with detailed analytics and insights to optimize your email strategy.',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'Set up automated email sequences that nurture leads and drive conversions without manual intervention.',
    color: 'text-indigo-600 bg-indigo-900/20',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with SOC 2 compliance, ensuring your data and campaigns are always protected.',
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
    content: 'FHG AI Bot transformed our email marketing. The AI-generated content increased our open rates by 40% and the automation saved us 15 hours per week.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'GrowthStart',
    content: 'The bot automation and audience segmentation features helped us scale our email campaigns from 1,000 to 50,000 subscribers in just 6 months.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'E-commerce Manager',
    company: 'StyleHub',
    content: 'Setting up email bots was incredibly easy. Our conversion rates improved by 25% and we can now focus on strategy instead of manual sending.',
    rating: 5,
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              🚀 Now with AI-Powered Email Generation
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Supercharge Your
              <span className="text-blue-600 dark:text-blue-400"> Email Marketing</span>
              <br />
              with AI
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create compelling email campaigns, automate your outreach, and drive conversions with our intelligent email marketing platform powered by advanced AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-8 py-4">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to succeed in email marketing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From AI-powered content generation to advanced automation, we've got you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
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

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        Start Free Trial
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
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
