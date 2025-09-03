'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Plus, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { useGet } from '@/hooks/useApi';
import { Bot as BotType } from '@/types';
import { cn } from '@/lib/utils';

const getBotStatusConfig = (isActive: boolean) => {
  if (isActive) {
    return {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      icon: CheckCircle,
      label: 'Active'
    };
  } else {
    return {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      icon: XCircle,
      label: 'Inactive'
    };
  }
};

export function BotStatus() {
  const { data: bots, loading, error } = useGet<BotType[]>('/bots?limit=5');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bot Status</CardTitle>
              <CardDescription>Your email bots and their performance</CardDescription>
            </div>
            <Button size="sm" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Add Bot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bot Status</CardTitle>
          <CardDescription>Your email bots and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Failed to load bot status. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const botList = bots || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bot Status</CardTitle>
            <CardDescription>Your email bots and their performance</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Bot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {botList.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bots configured
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Set up your first email bot to start sending campaigns
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Configure Bot
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {botList.map((bot) => {
              const statusConfig = getBotStatusConfig(bot.isActive);
              const StatusIcon = statusConfig.icon;
              const dailyUsagePercent = (bot.emailsSentToday / bot.dailyEmailLimit) * 100;

              return (
                <div key={bot._id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        bot.isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                      )}>
                        <Bot className={cn(
                          'w-4 h-4',
                          bot.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {bot.name}
                        </h4>
                        <Badge className={cn('text-xs', statusConfig.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Daily Usage</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {bot.emailsSentToday.toLocaleString()} / {bot.dailyEmailLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={dailyUsagePercent} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-500 dark:text-gray-400">Total Sent:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {bot.performance.totalEmailsSent.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3 text-green-500" />
                        <span className="text-gray-500 dark:text-gray-400">Open Rate:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {bot.performance.openRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {botList.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Manage All Bots
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
