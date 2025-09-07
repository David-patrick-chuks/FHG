'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactAPI, ContactFormData } from '@/lib/api';
import {
  CheckCircle,
  Mail,
  MessageSquare,
  Phone,
  Send
} from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await ContactAPI.submitContactForm(formData);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Failed to send message. Please try again or contact us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email anytime',
      value: 'support@mailquill.com',
      action: 'mailto:support@mailquill.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Reach us directly by phone',
      value: '+234 701 418 5686',
      action: 'tel:+2347014185686'
    }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Community',
      description: 'Join our WhatsApp community for instant help and updates',
      badge: 'Join Now',
      action: 'https://wa.me/2347014185686'
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
                  Contact Us
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We're here to help you succeed
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Quick Response
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Have questions about MailQuill? Need help with your account? Want to discuss a custom solution? 
            We're here to help you succeed with your email marketing goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8 animate-in fade-in-50 duration-500">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 animate-in slide-in-from-bottom-2 duration-500">
                      Message Sent Successfully! 🎉
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 animate-in slide-in-from-bottom-2 duration-700">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg animate-in slide-in-from-bottom-2 duration-1000">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        📧 Check your email for a confirmation message with our contact details!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {isSubmitting && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Sending your message...
                          </p>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                          disabled={isSubmitting}
                          className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting}
                          className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                        disabled={isSubmitting}
                        className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        required
                        disabled={isSubmitting}
                        className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </div>
                    
                    {submitError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          ❌ {submitError}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Multiple ways to reach us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {info.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {info.description}
                        </p>
                        {info.action ? (
                          <a 
                            href={info.action}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-900 dark:text-white">
                            {info.value}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Support Options */}
            <Card>
               <CardHeader>
                 <CardTitle>Community Support</CardTitle>
                 <CardDescription>
                   Join our community for instant help
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {supportOptions.map((option, index) => {
                   const Icon = option.icon;
                   return (
                     <a 
                       key={index} 
                       href={option.action}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                     >
                       <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                         <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center space-x-2 mb-1">
                           <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                             {option.title}
                           </h4>
                           <Badge variant="secondary" className="text-xs">
                             {option.badge}
                           </Badge>
                         </div>
                         <p className="text-xs text-gray-600 dark:text-gray-400">
                           {option.description}
                         </p>
                       </div>
                     </a>
                   );
                 })}
               </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How quickly do you respond to support requests?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We typically respond to all support requests within 24 hours. You can also reach us directly by phone for immediate assistance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer phone support?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Yes! Phone support is available for all users. You can call us directly or join our WhatsApp community for instant help.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I schedule a demo or consultation?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Absolutely! We offer personalized demos and consultations for businesses looking to implement advanced email marketing strategies. Contact us to schedule.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What if I need help with integration?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our technical team can help you integrate MailQuill with your existing systems. We provide detailed documentation and hands-on support for complex integrations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer training for teams?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Yes! We offer team training sessions, webinars, and workshops to help your team get the most out of MailQuill. Contact us to discuss your training needs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How can I provide feedback or suggestions?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We love hearing from our users! You can submit feedback through our contact form, join our community forum, or reach out directly to our product team.
                </p>
              </div>
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
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => {
                const message = encodeURIComponent('Hi! I would like to schedule a demo of MailQuill. Please help me set up a time that works for you.');
                const whatsappUrl = `https://wa.me/2347014185686?text=${message}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
