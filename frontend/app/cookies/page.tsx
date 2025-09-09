'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiePolicyPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
 
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Cookie Policy
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
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
                    <li><strong>Authentication:</strong> To keep you logged in and maintain your session using JWT tokens</li>
                    <li><strong>Preferences:</strong> To remember your cookie consent preferences and theme settings</li>
                    <li><strong>Analytics:</strong> To understand how you use our platform and improve our services (with your consent)</li>
                    <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
                  
                  <h3 className="text-xl font-medium mb-3">3.1 Essential Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and authentication. The website cannot function properly without these cookies.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>JWT authentication tokens (stored in localStorage)</li>
                    <li>Session management cookies</li>
                    <li>CSRF protection tokens</li>
                    <li>Cookie consent preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.2 Functional Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies enable the website to provide enhanced functionality and personalization. They are only set with your explicit consent.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Theme preferences (dark/light mode)</li>
                    <li>User interface preferences</li>
                    <li>Dashboard layout settings</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.3 Analytics Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services. We use Vercel Analytics for this purpose.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Page view tracking (anonymized)</li>
                    <li>User journey analysis (no personal data)</li>
                    <li>Performance monitoring</li>
                    <li>Feature usage statistics (aggregated)</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">3.4 Marketing Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Currently, we do not use marketing cookies or third-party advertising services. If this changes in the future, we will update this policy and seek your consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We use the following third-party services that may set cookies:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Vercel Analytics:</strong> For website analytics and performance monitoring (with consent)</li>
                    <li><strong>Paystack:</strong> For payment processing (essential for subscription services)</li>
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
                    Our authentication tokens expire after 24 hours (or 30 days if "Remember Me" is selected). Cookie consent preferences are stored for 1 year. Analytics data is retained for up to 24 months.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Managing Your Cookie Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    You have several options for managing cookies:
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3">6.1 Cookie Consent Banner</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time by clicking the cookie settings link in our footer.
                  </p>

                  <h3 className="text-xl font-medium mb-3 mt-6">6.2 Browser Settings</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set preferences for specific websites</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Impact of Disabling Cookies</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you choose to disable cookies, some features of our website may not function properly. This may include:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4 mt-4">
                    <li>Inability to stay logged in</li>
                    <li>Loss of theme preferences</li>
                    <li>Need to re-accept cookie preferences on each visit</li>
                    <li>Reduced ability to track and improve website performance</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Data Protection</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We are committed to protecting your privacy. Our analytics cookies do not collect personal information and are used only to improve our services. All data is processed in accordance with our Privacy Policy and applicable data protection laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Updates to This Cookie Policy</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                  </p>
                  <div className="mt-2 text-gray-600 dark:text-gray-300">
                    <p>Email: privacy@mailquill.com</p>
                    <p>Address: Lagos, Nigeria</p>
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
