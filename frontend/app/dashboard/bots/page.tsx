'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Bot } from '@/types';
import { Bot as BotIcon, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch bots from backend
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="AI Email Bots" description="Manage your AI email bots">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="AI Email Bots"
      description="Manage your AI email bots and their configurations"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bot
        </Button>
      }
    >
      <div className="space-y-6">
        {bots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BotIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No bots created yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                Create your first AI email bot to start sending personalized emails
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot._id}>
                <CardHeader>
                  <CardTitle>{bot.name}</CardTitle>
                  <CardDescription>{bot.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Email: {bot.email}</p>
                  <p>Status: {bot.isActive ? 'Active' : 'Inactive'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
