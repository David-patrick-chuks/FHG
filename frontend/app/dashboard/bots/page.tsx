'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Bot as BotIcon, Edit, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Updated interface to match backend model
interface Bot {
  _id: string;
  userId: string;
  name: string;
  description: string;
  email: string;
  prompt: string;
  isActive: boolean;
  dailyEmailCount: number;
  lastEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function BotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
    prompt: '',
    isActive: true
  });

  // Mock data for now - will be replaced with API calls later
  const mockBots: Bot[] = [
    {
      _id: '1',
      userId: 'user1',
      name: 'Sales Outreach Bot',
      description: 'AI-powered sales outreach bot for cold emailing prospects',
      email: 'sales@company.com',
      prompt: 'You are a professional sales representative reaching out to potential clients. Be friendly, professional, and focus on how our solution can help solve their business problems. Keep the tone conversational and avoid being too pushy.',
      isActive: true,
      dailyEmailCount: 45,
      lastEmailSentAt: new Date('2024-01-15T10:30:00Z'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: '2',
      userId: 'user1',
      name: 'Customer Support Bot',
      description: 'Automated customer support and follow-up bot',
      email: 'support@company.com',
      prompt: 'You are a helpful customer support representative. Your goal is to provide excellent customer service, answer questions clearly, and ensure customer satisfaction. Be empathetic and solution-oriented.',
      isActive: true,
      dailyEmailCount: 28,
      lastEmailSentAt: new Date('2024-01-15T09:15:00Z'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: '3',
      userId: 'user1',
      name: 'Newsletter Bot',
      description: 'Weekly newsletter and content distribution bot',
      email: 'newsletter@company.com',
      prompt: 'You are a content curator sharing valuable industry insights and company updates. Make the content engaging, informative, and relevant to our audience. Include clear calls-to-action when appropriate.',
      isActive: false,
      dailyEmailCount: 0,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    }
  ];

  // Load mock data on component mount
  useState(() => {
    setBots(mockBots);
    setIsLoading(false);
  });



  const handleEditBot = () => {
    if (!editingBot) return;

    // TODO: Implement bot editing API call
    const updateData = { ...formData };
    
    // If password is empty, don't update it (keep existing)
    if (!updateData.password.trim()) {
      updateData.password = '';
    }
    
    const updatedBots = bots.map(bot => 
      bot._id === editingBot._id 
        ? { ...bot, ...updateData, updatedAt: new Date() }
        : bot
    );

    setBots(updatedBots);
    setIsEditDialogOpen(false);
    setEditingBot(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      password: '',
      prompt: '',
      isActive: true
    });
  };

  const openEditDialog = (bot: Bot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description,
      email: bot.email,
      password: '', // Don't show existing password
      prompt: bot.prompt,
      isActive: bot.isActive
    });
    setIsEditDialogOpen(true);
  };

  const deleteBot = (botId: string) => {
    if (confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      // TODO: Implement bot deletion API call
      setBots(prev => prev.filter(bot => bot._id !== botId));
    }
  };

  const toggleBotStatus = (botId: string) => {
    // TODO: Implement bot status toggle API call
    setBots(prev => prev.map(bot => 
      bot._id === botId 
        ? { ...bot, isActive: !bot.isActive, updatedAt: new Date() }
        : bot
    ));
  };



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
        <Button 
          onClick={() => router.push('/dashboard/bots/create')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Bot
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
              <Button onClick={() => router.push('/dashboard/bots/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot._id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {bot.description}
                      </CardDescription>
                    </div>
                    <Badge variant={bot.isActive ? "default" : "secondary"}>
                      {bot.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BotIcon className="h-4 w-4" />
                    <span>AI Email Bot</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Bot Email</span>
                      <span className="font-medium">{bot.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Daily Emails</span>
                      <span className="font-medium">{bot.dailyEmailCount}</span>
                    </div>
                    {bot.lastEmailSentAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Email</span>
                        <span className="font-medium">
                          {new Date(bot.lastEmailSentAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-2">AI Prompt Preview:</div>
                      <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border max-h-20 overflow-y-auto">
                        {bot.prompt.length > 100 
                          ? `${bot.prompt.substring(0, 100)}...` 
                          : bot.prompt
                        }
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(bot)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBotStatus(bot._id)}
                      >
                        {bot.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBot(bot._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Bot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Update your AI email bot configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Bot Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Bot Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Email Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter new password (leave blank to keep current)"
                className="flex-1"
              />
              <p className="text-sm text-gray-500">
                Leave password blank if you don't want to change it
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prompt">
                AI Prompt <span className="text-sm text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe how the AI should behave and write emails... (Optional)"
                rows={6}
              />
              <p className="text-sm text-gray-500">
                This prompt defines how your AI bot will write emails. Be specific about tone, style, and goals. 
                <span className="text-amber-600 font-medium"> This field is optional and can be configured later.</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Bot is active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditBot}
                disabled={!formData.name.trim() || !formData.email.trim()}
              >
                Update Bot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
