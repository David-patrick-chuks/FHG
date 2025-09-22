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
    title: 'AI that actually gets it',
    description: 'Our AI writes emails that sound like you, not a robot. It learns your voice and creates content your audience actually wants to read.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Bot,
    title: 'Set it and forget it',
    description: 'Create email sequences that work while you sleep. No more manual sending or worrying about timing - we handle it all.',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: Target,
    title: 'Send to the right people',
    description: 'Stop blasting everyone with the same email. Target the right message to the right person at the right time.',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: BarChart3,
    title: 'See what actually works',
    description: 'Get real insights about your emails. See who opens, clicks, and converts - then make your campaigns even better.',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Zap,
    title: 'Automation that makes sense',
    description: 'Build email flows that feel natural. Welcome new subscribers, follow up with interested leads, and nurture relationships automatically.',
    color: 'text-indigo-600 bg-indigo-900/20',
  },
  {
    icon: Shield,
    title: 'Your data stays safe',
    description: 'We take security seriously. Your customer data is protected with the same level of security as your bank.',
    color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  },
];

export const stats = [
  {
    end: 10,
    suffix: 'M+',
    duration: 2500,
    gradient: 'from-blue-500 to-blue-600',
    color: 'from-blue-500/20 to-blue-600/20',
    label: 'emails that actually got opened',
  },
  {
    end: 98.5,
    suffix: '%',
    duration: 2000,
    gradient: 'from-cyan-500 to-cyan-600',
    color: 'from-cyan-500/20 to-cyan-600/20',
    label: 'of emails reach inboxes (not spam)',
  },
  {
    end: 45,
    suffix: '%',
    duration: 1800,
    gradient: 'from-blue-600 to-cyan-500',
    color: 'from-blue-600/20 to-cyan-500/20',
    label: 'of people actually read our emails',
  },
  {
    end: 500,
    suffix: '+',
    duration: 2200,
    gradient: 'from-cyan-600 to-blue-500',
    color: 'from-cyan-600/20 to-blue-500/20',
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