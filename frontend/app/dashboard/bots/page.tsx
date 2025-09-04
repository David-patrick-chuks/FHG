'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot as BotIcon, Edit, Grid3X3, List, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Updated interface to match backend model
interface Bot {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  emailSignature?: string;
  dailyEmailLimit: number;
  emailsSentToday: number;
  lastEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function BotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [deletingBot, setDeletingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for now - will be replaced with API calls later
  const mockBots: Bot[] = [
    {
      _id: '1',
      name: 'Sales Outreach Bot',
      description: 'AI-powered sales outreach bot for cold emailing prospects',
      isActive: true,
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'sales@company.com',
        password: 'password123',
        fromEmail: 'sales@company.com',
        fromName: 'Sales Team'
      },
      dailyEmailLimit: 500,
      emailsSentToday: 45,
      lastEmailSentAt: new Date('2024-01-20T10:30:00Z'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: '2',
      name: 'Customer Support Bot',
      description: 'Automated customer support and follow-up bot',
      isActive: true,
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'support@company.com',
        password: 'password123',
        fromEmail: 'support@company.com',
        fromName: 'Support Team'
      },
      dailyEmailLimit: 500,
      emailsSentToday: 28,
      lastEmailSentAt: new Date('2024-01-20T09:15:00Z'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: '3',
      name: 'Newsletter Bot',
      description: 'Weekly newsletter and content distribution bot',
      isActive: true,
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'newsletter@company.com',
        password: 'password123',
        fromEmail: 'newsletter@company.com',
        fromName: 'Newsletter Team'
      },
      dailyEmailLimit: 500,
      emailsSentToday: 15,
      lastEmailSentAt: new Date('2024-01-19T14:00:00Z'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-19')
    },
    {
      _id: '4',
      name: 'Lead Nurturing Bot',
      description: 'Automated lead nurturing and follow-up sequences',
      isActive: false,
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'leads@company.com',
        password: 'password123',
        fromEmail: 'leads@company.com',
        fromName: 'Lead Generation Team'
      },
      dailyEmailLimit: 500,
      emailsSentToday: 0,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    }
  ];

  // Load mock data on component mount
  useState(() => {
    setBots(mockBots);
    setIsLoading(false);
  });

  // Filter bots based on search query
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.smtpConfig.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditBot = () => {
    if (!editingBot) return;

    // TODO: Implement bot editing API call
    const updateData = { ...formData };
    
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
      description: ''
    });
  };

  const openEditDialog = (bot: Bot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (bot: Bot) => {
    setDeletingBot(bot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBot = () => {
    if (!deletingBot) return;

      // TODO: Implement bot deletion API call
    setBots(prev => prev.filter(bot => bot._id !== deletingBot._id));
    setIsDeleteDialogOpen(false);
    setDeletingBot(null);
  };

  const toggleBotStatus = (botId: string) => {
    // TODO: Implement bot status toggle API call
    setBots(prev => prev.map(bot => 
      bot._id === botId 
        ? { ...bot, isActive: !bot.isActive, updatedAt: new Date() }
        : bot
    ));
  };

  // Generate bot avatar colors
  const getBotAvatarColor = (botId: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = parseInt(botId) % colors.length;
    return colors[index];
  };

  // Generate random animation delay for each bot
  const getBotAnimationDelay = (botId: string) => {
    const delays = ['delay-0', 'delay-75', 'delay-150', 'delay-300', 'delay-500', 'delay-700', 'delay-1000'];
    const index = parseInt(botId) % delays.length;
    return delays[index];
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Bots" description="Manage your email bots">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Bots"
      description="Manage your email bots and their configurations"
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
      {/* Sticky Search and View Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 mb-6">
        <div className="w-full space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
              placeholder="Search bots by name, description, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 text-base"
                  />
                </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
                  <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-4 py-2"
              >
                <List className="h-4 w-4" />
                List
                  </Button>
                </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredBots.length} of {bots.length} bots
              {searchQuery && ` matching "${searchQuery}"`}
                  </div>
              </div>
              </div>
              </div>

      <div className="space-y-6">
        {filteredBots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BotIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No bots found' : 'No bots created yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                {searchQuery 
                  ? `No bots match "${searchQuery}". Try adjusting your search.`
                  : 'Create your first email bot to start sending personalized emails'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/dashboard/bots/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBots.map((bot) => (
                  <Card key={bot._id} className="relative hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                    <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                            <AvatarImage src={`/api/bots/${bot._id}/avatar`} alt={bot.name} />
                            <AvatarFallback className={`${getBotAvatarColor(bot._id)} text-white text-xl font-semibold`}>
                              {bot.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white truncate block max-w-full">{bot.name}</CardTitle>
                            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words max-w-full overflow-hidden">
                              {bot.description || 'No description'}
                      </CardDescription>
                    </div>
                        </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${bot.isActive ? `bg-green-500 animate-pulse ${getBotAnimationDelay(bot._id)}` : 'bg-red-500'}`}></div>
                        </div>
                  </div>
                </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Bot Email</span>
                            <span className="font-medium text-gray-900 dark:text-white">{bot.smtpConfig.username}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Daily Emails</span>
                            <span className="font-medium text-gray-900 dark:text-white">{bot.emailsSentToday} / {bot.dailyEmailLimit}</span>
                    </div>
                    {bot.lastEmailSentAt && (
                      <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Last Email</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(bot.lastEmailSentAt).toLocaleDateString()} {new Date(bot.lastEmailSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Reset Time</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {bot.lastEmailSentAt 
                                ? new Date(bot.lastEmailSentAt).toLocaleDateString() + ' ' + new Date(bot.lastEmailSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Not set'
                              }
                            </span>
                      </div>
                    </div>

                        <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                            className="flex-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:border-blue-700"
                        onClick={() => openEditDialog(bot)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                            className="hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 dark:hover:border-orange-700"
                        onClick={() => toggleBotStatus(bot._id)}
                      >
                        {bot.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                            className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950 dark:hover:border-red-700"
                            onClick={() => openDeleteDialog(bot)}
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

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredBots.map((bot) => (
                  <Card key={bot._id} className="relative hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={`/api/bots/${bot._id}/avatar`} alt={bot.name} />
                            <AvatarFallback className={`${getBotAvatarColor(bot._id)} text-white font-semibold`}>
                              {bot.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{bot.name}</h3>
                              <div className={`w-2 h-2 rounded-full ${bot.isActive ? `bg-green-500 animate-pulse ${getBotAnimationDelay(bot._id)}` : 'bg-red-500'}`}></div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                              {bot.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Email:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{bot.smtpConfig.username}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Daily:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{bot.emailsSentToday} / {bot.dailyEmailLimit}</span>
                              </span>
                              {bot.lastEmailSentAt && (
                                <span className="flex items-center gap-1">
                                  <span className="text-gray-400">Last:</span>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {new Date(bot.lastEmailSentAt).toLocaleDateString()} {new Date(bot.lastEmailSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(bot)}
                            className="h-8 px-3"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBotStatus(bot._id)}
                            className="h-8 px-3"
                          >
                            {bot.isActive ? 'Stop' : 'Start'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(bot)}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
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
          </>
        )}
      </div>

      {/* Edit Bot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Update your bot name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Bot Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={50}
                placeholder="Enter bot name (max 50 characters)"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Bot name should be descriptive and unique</span>
                <span className={formData.name.length > 45 ? 'text-orange-500' : ''}>
                  {formData.name.length}/50
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                maxLength={200}
                placeholder="Describe what this bot does (max 200 characters)"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Brief description of the bot's purpose</span>
                <span className={formData.description.length > 180 ? 'text-orange-500' : ''}>
                  {formData.description.length}/200
                </span>
            </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditBot}
                disabled={!formData.name.trim() || formData.name.length > 50 || formData.description.length > 200}
              >
                Update Bot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deletingBot && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${getBotAvatarColor(deletingBot._id)} text-white`}>
                      {deletingBot.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">{deletingBot.name}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{deletingBot.description}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDeleteBot}
              >
                Delete Bot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
