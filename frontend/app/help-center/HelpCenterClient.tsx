'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Clock,
    ExternalLink,
    FileText,
    HelpCircle,
    MessageSquare,
    Search,
    Shield,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function HelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState('');

  // Unified help data structure
  const helpData = [
    {
      category: 'Getting Started',
      icon: Zap,
      items: [
        {
          question: 'How do I create my first email campaign?',
          answer: 'To create your first campaign, go to the Campaigns section in your dashboard, click "Create Campaign", choose a template or start from scratch, add your content, select your audience, and schedule or send immediately.'
        },
        {
          question: 'What email providers can I connect to MailQuill?',
          answer: 'MailQuill supports all major email providers including Gmail, Outlook, Yahoo, and custom SMTP servers. You can connect multiple accounts and switch between them easily.'
        },
        {
          question: 'Is there a limit to the number of emails I can send?',
          answer: 'Email limits depend on your subscription plan. Free plans have monthly limits, while paid plans offer higher limits and additional features. Check your plan details in the billing section.'
        },
        {
          question: 'How do I set up email templates?',
          answer: 'Navigate to the Templates section in your dashboard, click "Create Template", choose from our pre-designed templates or start with a blank canvas. You can customize colors, fonts, and layout to match your brand.'
        },
        {
          question: 'How do I understand my dashboard?',
          answer: 'Your dashboard provides an overview of your email marketing performance. You can view campaign statistics, audience growth, engagement metrics, and recent activity all in one place.'
        }
      ]
    },
    {
      category: 'Campaign Management',
      icon: Users,
      items: [
        {
          question: 'How do I segment my email list?',
          answer: 'You can segment your list by demographics, behavior, engagement history, and custom fields. Use the Audience section to create segments and apply them to your campaigns.'
        },
        {
          question: 'Can I schedule campaigns for later?',
          answer: 'Yes! You can schedule campaigns to be sent at specific dates and times. You can also set up recurring campaigns for newsletters and automated sequences.'
        },
        {
          question: 'How do A/B tests work?',
          answer: 'A/B testing allows you to test different versions of your email (subject lines, content, send times) with a portion of your audience to determine which performs better.'
        },
        {
          question: 'How do I build email campaigns?',
          answer: 'Start by creating a new campaign, choose your template, add compelling content, select your target audience, and configure your sending options. Use our drag-and-drop editor for easy customization.'
        },
        {
          question: 'How do I view campaign analytics?',
          answer: 'Access detailed analytics in the Campaigns section. View open rates, click rates, bounce rates, and other key metrics to measure your campaign performance.'
        }
      ]
    },
    {
      category: 'Account & Security',
      icon: Shield,
      items: [
        {
          question: 'How do I upgrade my subscription?',
          answer: 'Go to your account settings, click on "Billing", and select "Upgrade Plan". You can choose from our available plans and the change will take effect immediately.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time from your account settings. Your account will remain active until the end of your current billing period.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact our support team if you need assistance with a refund request.'
        },
        {
          question: 'How do I set up two-factor authentication?',
          answer: 'Go to Account Settings > Security, enable Two-Factor Authentication, and follow the setup instructions. We recommend using an authenticator app for enhanced security.'
        },
        {
          question: 'How do I manage API keys?',
          answer: 'Navigate to Account Settings > Integrations to view and manage your API keys. You can generate new keys, revoke existing ones, and view usage statistics.'
        }
      ]
    },
    {
      category: 'Troubleshooting',
      icon: FileText,
      items: [
        {
          question: 'What should I do if emails are not being delivered?',
          answer: 'Check your email provider settings, verify your SMTP credentials, ensure your domain is properly configured, and check if your emails are being marked as spam.'
        },
        {
          question: 'Why are my email templates not rendering correctly?',
          answer: 'Ensure you\'re using supported HTML/CSS, test your templates across different email clients, and avoid using complex CSS that might not be supported.'
        },
        {
          question: 'How do I troubleshoot integration issues?',
          answer: 'Verify your API credentials, check the integration status in your dashboard, review error logs, and ensure your third-party service is properly configured.'
        },
        {
          question: 'How can I optimize my email performance?',
          answer: 'Focus on improving your subject lines, segment your audience effectively, optimize send times, maintain a clean email list, and test different content variations.'
        }
      ]
    },
    {
      category: 'Support & Contact',
      icon: MessageSquare,
      items: [
        {
          question: 'How can I contact support?',
          answer: 'You can reach our support team through live chat (available 24/7), email at support@mailquill.com, or phone at +2347014185686 (Mon-Fri 9AM-6PM).'
        },
        {
          question: 'Where can I find video tutorials?',
          answer: 'Visit our tutorials section for step-by-step video guides covering all aspects of MailQuill. These self-paced learning resources are perfect for getting started.'
        },
      ]
    }
  ];

  // Filter help data based on search query
  const filteredHelpData = helpData.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const quickLinks = [
    { title: 'API Documentation', href: '/api-docs', icon: FileText },
    { title: 'System Status', href: '/system-status', icon: Clock }
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
                  Help Center
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Find answers and get support
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Support
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Find answers to common questions, learn how to use MailQuill effectively, and get the support you need.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles, guides, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {/* Help Center Accordion */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Help Center
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Find answers to your questions organized by category'}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {filteredHelpData.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredHelpData.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  return (
                    <div key={categoryIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.category}
                </h4>
                        <Badge variant="secondary" className="text-xs">
                          {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>
                <Accordion type="single" collapsible className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <AccordionItem 
                            key={itemIndex} 
                            value={`${categoryIndex}-${itemIndex}`} 
                            className="border border-gray-100 dark:border-gray-600 rounded-lg px-4"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-3">
                              <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-400 pb-4">
                              {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
                  );
                })}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try searching with different keywords or browse our categories below.
                </p>
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Access additional resources and tools
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <Button variant="outline" className="flex items-center gap-2 h-12 px-6">
                    <Icon className="w-4 h-4" />
                    {link.title}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
{/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Still need help?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => {
                const message = encodeURIComponent('Hi! I need help with MailQuill. Can you assist me?');
                const whatsappUrl = `https://wa.me/2347014185686?text=${message}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              Contact Support
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Send Message
              </Button>
            </Link>
          </div>
        </div> 
      </main>
    </div>
  );
}
