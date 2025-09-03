'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Bot, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Create Campaign',
      description: 'Start a new email campaign',
      icon: Mail,
      href: '/dashboard/campaigns',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Add Bot',
      description: 'Configure a new email bot',
      icon: Bot,
      href: '/dashboard/bots',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'View Analytics',
      description: 'Check campaign performance',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      title: 'Manage Audience',
      description: 'Update your contact lists',
      icon: Users,
      href: '/dashboard/audience',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className={`mr-3 p-2 rounded-lg ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
