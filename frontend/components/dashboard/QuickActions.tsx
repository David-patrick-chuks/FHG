'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Bot, Mail, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_campaign':
        router.push('/dashboard/campaigns/create');
        break;
      case 'create_bot':
        router.push('/dashboard/bots/create');
        break;
      case 'import_contacts':
        router.push('/dashboard/audience');
        break;
      case 'view_reports':
        router.push('/dashboard/analytics');
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => handleQuickAction('create_campaign')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500 rounded-lg group-hover:bg-cyan-600 transition-colors">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Campaign</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Launch a new email campaign</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-200 dark:bg-cyan-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => handleQuickAction('create_bot')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Bot</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new AI bot</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 dark:bg-orange-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => handleQuickAction('import_contacts')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-600 rounded-lg group-hover:bg-cyan-700 transition-colors">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Email Lists</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your email lists</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-200 dark:bg-cyan-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => handleQuickAction('view_reports')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyze campaign performance</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 dark:bg-orange-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
