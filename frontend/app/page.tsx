'use client';

import { Button } from '@/components/ui/button';
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
import { useEffect, useRef, useState } from 'react';

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

// Counter animation component
function Counter({ end, duration = 2000, suffix = '', gradient = 'from-blue-400 to-cyan-400' }: { 
  end: number; 
  duration?: number; 
  suffix?: string; 
  gradient?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300`}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-white/90 text-sm font-medium">✨ AI-Powered Email Marketing</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                  Email Marketing
                </span>
                with AI
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed">
                Create, automate, and optimize email campaigns with AI technology that delivers results.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-10 py-5 h-14 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                      Access Dashboard
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="text-lg px-10 py-5 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300">
                        Get Started Free
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="text-lg px-10 py-5 h-14 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all duration-300">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
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
            </div>
            
            {/* Right Column - Dashboard Screenshot Placeholder */}
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
                  {/* Placeholder Image */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/20">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-white/90 text-sm font-medium">🚀 Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Everything You Need for
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                Email Marketing
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Powerful tools and AI automation to create, send, and optimize your email campaigns.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-md border border-white/20 mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300">
                <Counter end={10000000} suffix="+" duration={2500} gradient="from-blue-400 to-cyan-400" />
                <div className="text-white/70 font-medium text-lg">Emails Delivered</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300">
                <Counter end={98.5} suffix="%" duration={2000} gradient="from-green-400 to-emerald-400" />
                <div className="text-white/70 font-medium text-lg">Deliverability Rate</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300">
                <Counter end={45} suffix="%" duration={1800} gradient="from-cyan-400 to-blue-400" />
                <div className="text-white/70 font-medium text-lg">Average Open Rate</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300">
                <Counter end={500} suffix="+" duration={2200} gradient="from-orange-400 to-red-400" />
                <div className="text-white/70 font-medium text-lg">Enterprise Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
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
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent block">
                Email Marketing?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join industry leaders who trust MailQuill to deliver exceptional email marketing results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-12 py-6 h-16 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                    Access Dashboard
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="text-lg px-12 py-6 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300">
                        Get Started Free
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="text-lg px-12 py-6 h-16 bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all duration-300">
                        Sign In
                      </Button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">MailQuill</span>
              </div>
              <p className="text-white/70 leading-relaxed text-lg">
                The AI-powered email marketing platform that helps businesses create, automate, and optimize campaigns.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Product</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Company</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Press Kit</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Support</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Training</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 mb-4 md:mb-0 text-lg">&copy; 2024 MailQuill. All rights reserved.</p>
            <div className="flex space-x-8 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors text-lg">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors text-lg">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors text-lg">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
