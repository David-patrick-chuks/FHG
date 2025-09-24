'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/Breadcrumbs';
import { generatePageMetadata } from '@/lib/seo';
import {
  ArrowRight,
  Globe,
  Target
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata('about');

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'We put our customers at the center of everything we do.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving businesses worldwide with reliable email marketing solutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Breadcrumbs items={breadcrumbConfigs.about} className="mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  About MailQuill
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Empowering businesses through intelligent email marketing
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              About Us
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About MailQuill
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            We help businesses create meaningful connections with their audiences through intelligent email marketing automation.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                To provide powerful, easy-to-use email marketing tools that help businesses build meaningful relationships with their customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                To become the leading email marketing platform, empowering businesses to create exceptional customer experiences.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start your email marketing journey with MailQuill today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
