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
    <div className="group relative">
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
      <div className="relative p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quick Actions</h2>
          <p className="text-slate-600 dark:text-slate-300">Get started with common tasks</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div 
            className="group/campaign relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/60 dark:hover:bg-slate-800/60"
            onClick={() => handleQuickAction('create_campaign')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg group-hover/campaign:shadow-xl transition-all duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover/campaign:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Create Campaign</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Launch a new email campaign</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover/campaign:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group/bot relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/60 dark:hover:bg-slate-800/60"
            onClick={() => handleQuickAction('create_bot')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover/bot:shadow-xl transition-all duration-300">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover/bot:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Create Bot</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Create a new AI bot</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover/bot:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group/contacts relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/60 dark:hover:bg-slate-800/60"
            onClick={() => handleQuickAction('import_contacts')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl shadow-lg group-hover/contacts:shadow-xl transition-all duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover/contacts:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">View Email Lists</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Manage your email lists</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover/contacts:opacity-30 transition-opacity"></div>
          </div>
          
          <div 
            className="group/reports relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/60 dark:hover:bg-slate-800/60"
            onClick={() => handleQuickAction('view_reports')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg group-hover/reports:shadow-xl transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover/reports:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">View Reports</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Analyze campaign performance</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover/reports:opacity-30 transition-opacity"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
