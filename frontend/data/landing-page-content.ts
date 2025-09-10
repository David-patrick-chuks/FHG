import {
  BarChart3,
  Bot,
  Brain,
  Shield,
  Target,
  Zap
} from 'lucide-react';

export const features = [
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

export const stats = [
  {
    end: 10000000,
    suffix: '+',
    duration: 2500,
    gradient: 'from-blue-400 to-cyan-400',
    color: 'from-blue-500/20 to-cyan-500/20',
    label: 'emails that actually got opened',
  },
  {
    end: 98.5,
    suffix: '%',
    duration: 2000,
    gradient: 'from-green-400 to-emerald-400',
    color: 'from-green-500/20 to-emerald-500/20',
    label: 'of emails reach inboxes (not spam)',
  },
  {
    end: 45,
    suffix: '%',
    duration: 1800,
    gradient: 'from-cyan-400 to-blue-400',
    color: 'from-cyan-500/20 to-blue-500/20',
    label: 'of people actually read our emails',
  },
  {
    end: 500,
    suffix: '+',
    duration: 2200,
    gradient: 'from-orange-400 to-red-400',
    color: 'from-orange-500/20 to-red-500/20',
    label: 'businesses who made the switch',
  },
];

export const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechFlow Inc.',
    content: 'Honestly, I was skeptical at first. But MailQuill actually works. Our emails went from being ignored to getting real responses. My team loves how easy it is to use.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Founder',
    company: 'GrowthStart',
    content: 'We were struggling to grow our email list. MailQuill helped us connect with our audience in a way that felt genuine. The automation is smart, not spammy.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'E-commerce Manager',
    company: 'StyleHub',
    content: 'Finally, an email tool that doesn\'t make me feel like I\'m bothering people. The templates are beautiful and our customers actually look forward to our emails now.',
    rating: 5,
  },
];