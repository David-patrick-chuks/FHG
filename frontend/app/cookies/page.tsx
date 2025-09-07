'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CookiePolicyPage() {
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
              <CardTitle className="text-3xl font-bold">Cookie Policy</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and to provide information to website owners about how users interact with their sites.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    MailQuill uses cookies for several purposes to enhance your experience and provide our services effectively:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Authentication:</strong> To keep you logged in and maintain your session</li>
                    <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                    <li><strong>Analytics:</strong> To understand how you use our platform and improve our services</li>
                    <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
                    <li><strong>Performance:</strong> To optimize website performance and loading times</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
                  
                  <h3 className="text-xl font-medium mb-3">3.1 Essential Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and authentication. The website cannot function properly without these cookies.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Session management cookies</li>
                    <li>Authentication tokens</li>
                    <li>Security cookies</li>
                    <li>Load balancing cookies</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.2 Functional Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>User preference settings</li>
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>Dashboard layout preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.3 Analytics Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Page view tracking</li>
                    <li>User journey analysis</li>
                    <li>Feature usage statistics</li>
                    <li>Performance monitoring</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.4 Marketing Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    These cookies are used to track visitors across websites to display relevant and engaging advertisements. They help us measure the effectiveness of our marketing campaigns.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We may use third-party services that set their own cookies. These include:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Analytics Services:</strong> Google Analytics, Mixpanel, or similar services</li>
                    <li><strong>Payment Processors:</strong> Stripe, PayPal, or other payment providers</li>
                    <li><strong>Customer Support:</strong> Intercom, Zendesk, or similar support tools</li>
                    <li><strong>Marketing Tools:</strong> HubSpot, Mailchimp, or similar marketing platforms</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Cookie Duration</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Cookies can be either session cookies or persistent cookies:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Session Cookies:</strong> These are temporary and are deleted when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> These remain on your device for a set period or until you delete them</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                    Most of our cookies expire within 30 days, but some may persist for up to 2 years depending on their purpose.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Managing Your Cookie Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    You have several options for managing cookies:
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3">6.1 Browser Settings</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set preferences for specific websites</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">6.2 Cookie Consent Banner</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time through our cookie settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Impact of Disabling Cookies</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you choose to disable cookies, some features of our website may not function properly. This may include:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4 mt-4">
                    <li>Inability to stay logged in</li>
                    <li>Loss of personalized settings</li>
                    <li>Reduced website performance</li>
                    <li>Limited access to certain features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Updates to This Cookie Policy</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                  </p>
                  <div className="mt-2 text-gray-600 dark:text-gray-300">
                    <p>Email: privacy@mailquill.com</p>
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
