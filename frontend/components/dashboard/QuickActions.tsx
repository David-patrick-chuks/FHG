'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Mail,
  Bot,
  Users,
  BarChart3,
  Settings,
  Zap,
  Target,
  FileText,
  Brain,
  Upload,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost';
  badge?: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-campaign',
    title: 'New Campaign',
    description: 'Create a new email campaign',
    icon: Mail,
    href: '/dashboard/campaigns/new',
    variant: 'default',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'add-bot',
    title: 'Add Bot',
    description: 'Configure a new email bot',
    icon: Bot,
    href: '/dashboard/bots/new',
    variant: 'outline',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'import-audience',
    title: 'Import Audience',
    description: 'Upload contact lists',
    icon: Upload,
    href: '/dashboard/audience/import',
    variant: 'outline',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'ai-template',
    title: 'AI Template',
    description: 'Generate email with AI',
    icon: Brain,
    href: '/dashboard/templates/ai',
    variant: 'outline',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    badge: 'New',
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Check campaign performance',
    icon: BarChart3,
    href: '/dashboard/analytics',
    variant: 'ghost',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure your account',
    icon: Settings,
    href: '/dashboard/settings',
    variant: 'ghost',
    color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </div>
          <Zap className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Link key={action.id} href={action.href}>
                <Button
                  variant={action.variant}
                  className="w-full justify-start h-auto p-4 hover:shadow-md transition-all"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                    action.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </span>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Additional Quick Stats */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                12
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Active Campaigns
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                3
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Active Bots
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Need Help?
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Get started with our quick setup guide
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
