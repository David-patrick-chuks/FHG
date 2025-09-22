'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
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
                    Privacy Policy
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
                  <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    At MailQuill, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email marketing platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                  
                  <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We collect information you provide directly to us, such as:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Account information (username, email address, password)</li>
                    <li>Profile information (name, company details)</li>
                    <li>Payment information (billing address, payment method details)</li>
                    <li>Communication preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">2.2 Usage Information</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We automatically collect certain information about your use of our service:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Log data (IP address, browser type, pages visited)</li>
                    <li>Device information (device type, operating system)</li>
                    <li>Usage patterns and preferences</li>
                    <li>Campaign performance data</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">2.3 Email Lists and Contacts</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We store the email lists and contact information you upload to our platform for the purpose of managing your email campaigns. This data remains under your control and is used solely to provide our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze usage patterns and trends</li>
                    <li>Detect, prevent, and address technical issues</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred as part of the business assets</li>
                    <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or regulatory purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Depending on your location, you may have certain rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Access:</strong> Request access to your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                    <li><strong>Objection:</strong> Object to certain processing of your information</li>
                    <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences. Note that disabling cookies may affect the functionality of our service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
