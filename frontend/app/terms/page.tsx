'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">MailQuill</span>
                </Link>
              </div>
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Signup
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    By accessing and using MailQuill ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    MailQuill is an email marketing platform that provides tools for creating, managing, and sending email campaigns. Our service includes email extraction tools, campaign management, analytics, and related features.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To use our service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    You agree to use MailQuill only for lawful purposes and in accordance with these Terms. You agree not to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Send spam, unsolicited emails, or any form of bulk email without proper consent</li>
                    <li>Use the service to violate any applicable laws or regulations</li>
                    <li>Attempt to gain unauthorized access to any part of the service</li>
                    <li>Use the service to transmit malicious code or harmful content</li>
                    <li>Impersonate any person or entity or misrepresent your affiliation</li>
                    <li>Interfere with or disrupt the service or servers connected to the service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Email Marketing Compliance</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    You are responsible for ensuring that your email campaigns comply with applicable laws, including but not limited to the CAN-SPAM Act, GDPR, and other relevant regulations. This includes obtaining proper consent, providing unsubscribe options, and including required sender information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your use of the service is also governed by our Privacy Policy. By using the service, you consent to the collection and use of information as outlined in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Subscription and Payment</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Some features of the service may require a paid subscription. Subscription fees are billed in advance and are non-refundable except as required by law. We reserve the right to change our pricing with reasonable notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We strive to maintain high service availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect service availability.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To the maximum extent permitted by law, MailQuill shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination, your right to use the service will cease immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the service. Your continued use of the service after such modifications constitutes acceptance of the updated Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-2 text-gray-600 dark:text-gray-300">
                    <p>Email: legal@mailquill.com</p>
                    <p>Address: Lagos Nigeria</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
