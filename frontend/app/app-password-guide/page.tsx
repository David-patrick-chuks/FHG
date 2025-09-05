'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, ExternalLink, Info, Key, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AppPasswordGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <Link href="/dashboard/bots/create">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Create Bot
                </Button>
              </Link> */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gmail App Password Guide
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn how to create an app password for your Gmail account
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Guide
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                What is an App Password?
              </CardTitle>
              <CardDescription>
                An app password is a special password that allows third-party applications to access your Gmail account securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Why You Need an App Password
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Gmail blocks regular passwords for security reasons</li>
                      <li>• App passwords provide secure access for applications</li>
                      <li>• Required for SMTP email sending from third-party apps</li>
                      <li>• More secure than using your main Gmail password</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Prerequisites
              </CardTitle>
              <CardDescription>
                Make sure you have these requirements before creating an app password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">2-Factor Authentication</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your Gmail account must have 2FA enabled
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Gmail Account</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      You need a valid Gmail or Google Workspace account
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step-by-Step Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                Step-by-Step Guide
              </CardTitle>
              <CardDescription>
                Follow these steps to create an app password for your Gmail account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Go to Google Account Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Visit the Google App Passwords page to start the process.
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open App Passwords Page
                    </a>
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Sign in to Your Google Account
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you're not already signed in, enter your Gmail credentials to access your account settings.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Select "Mail" as the App
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    From the dropdown menu, select "Mail" as the application type for your app password.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Choose Your Device
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select "Other (custom name)" and enter a descriptive name like "FHG AI Bot" or "Email Bot".
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Generate the App Password
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Click "Generate" and Google will create a 16-character app password for you.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Important: Save Your App Password
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Copy the generated password immediately. Google will only show it once, and you won't be able to see it again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Use the App Password in Your Bot
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Copy the generated app password and paste it into the "Email Password" field when creating your bot.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          App Password Format
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Your app password will look like: <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">abcd efgh ijkl mnop</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-red-600" />
                Video Tutorial
              </CardTitle>
              <CardDescription>
                Watch this step-by-step video guide to see how to create an app password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/wniM7sU0bmU?si=aR8NeEGLpaTlGTpI"
                  title="Gmail App Password Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Video Guide Benefits
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This video shows the exact steps visually, making it easier to follow along and understand the process.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Troubleshooting
              </CardTitle>
              <CardDescription>
                Common issues and solutions when creating app passwords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    "App passwords aren't available for your account"
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    This means 2-Factor Authentication is not enabled. Go to your Google Account security settings and enable 2FA first.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    "Invalid credentials" error
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Make sure you're using the app password (not your regular Gmail password) and that there are no extra spaces.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Can't find the App Passwords option
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Make sure you're signed in with a personal Gmail account. Google Workspace accounts may have different settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Security Best Practices
              </CardTitle>
              <CardDescription>
                Keep your Gmail account secure when using app passwords.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Use App Passwords</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Never use your main Gmail password for third-party applications.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Regular Review</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Periodically review and revoke unused app passwords.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Unique Names</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Give each app password a descriptive name for easy identification.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Secure Storage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Store app passwords securely and don't share them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Create Your Bot?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Now that you have your app password, you can create your AI email bot and start sending emails.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/bots/create">
                    Create Your Bot
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
