'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePut } from '@/hooks/useApi';
import { Bot, Campaign } from '@/types';
import { ChevronLeft, ChevronRight, Grid3X3, List, Mail, Pause, Play, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CampaignsPage() {
  const router = useRouter();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [pausingCampaign, setPausingCampaign] = useState<Campaign | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Dummy data for demonstration
  const dummyCampaigns: Campaign[] = [
    {
      _id: '1',
      name: 'Q1 Sales Outreach',
      description: 'Targeted sales campaign for Q1 prospects in the tech industry',
      botId: 'bot1',
      emailList: ['john@techcorp.com', 'sarah@startup.io', 'mike@enterprise.com', 'lisa@innovation.co'],
      aiPrompt: 'Write a professional sales email introducing our new AI solution. Focus on ROI and problem-solving.',
      status: 'running',
      sentEmails: ['john@techcorp.com', 'sarah@startup.io'],
      aiMessages: ['ai_message_1', 'ai_message_2'],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: '2',
      name: 'Customer Onboarding',
      description: 'Welcome series for new customers to ensure successful product adoption',
      botId: 'bot2',
      emailList: ['newuser1@company.com', 'newuser2@company.com', 'newuser3@company.com'],
      aiPrompt: 'Create a warm, helpful welcome email series. Be encouraging and provide clear next steps.',
      status: 'completed',
      sentEmails: ['newuser1@company.com', 'newuser2@company.com', 'newuser3@company.com'],
      aiMessages: ['ai_message_3', 'ai_message_4', 'ai_message_5'],
      selectedMessageIndex: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    },
    {
      _id: '3',
      name: 'Product Launch Announcement',
      description: 'Exciting announcement for our new AI-powered email automation platform',
      botId: 'bot3',
      emailList: ['subscriber1@newsletter.com', 'subscriber2@newsletter.com', 'subscriber3@newsletter.com', 'subscriber4@newsletter.com', 'subscriber5@newsletter.com'],
      aiPrompt: 'Write an exciting product launch email. Use compelling language and include a clear call-to-action.',
      status: 'paused',
      sentEmails: ['subscriber1@newsletter.com', 'subscriber2@newsletter.com'],
      aiMessages: ['ai_message_6', 'ai_message_7'],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-16')
    },
    {
      _id: '4',
      name: 'Holiday Special Offer',
      description: 'Limited-time holiday promotion for existing customers',
      botId: 'bot1',
      emailList: ['customer1@company.com', 'customer2@company.com', 'customer3@company.com', 'customer4@company.com'],
      aiPrompt: 'Create an email highlighting our holiday special offer. Be festive and create urgency.',
      status: 'draft',
      sentEmails: [],
      aiMessages: [],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    },
    {
      _id: '5',
      name: 'Weekly Newsletter',
      description: 'Regular weekly newsletter with industry updates and company news',
      botId: 'bot3',
      emailList: ['subscriber1@newsletter.com', 'subscriber2@newsletter.com', 'subscriber3@newsletter.com', 'subscriber4@newsletter.com', 'subscriber5@newsletter.com', 'subscriber6@newsletter.com'],
      aiPrompt: 'Write an engaging weekly newsletter. Include industry insights and company updates.',
      status: 'running',
      sentEmails: ['subscriber1@newsletter.com', 'subscriber2@newsletter.com', 'subscriber3@newsletter.com'],
      aiMessages: ['ai_message_8', 'ai_message_9', 'ai_message_10'],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-19')
    },
    {
      _id: '6',
      name: 'Product Feedback Request',
      description: 'Collect feedback from recent product users to improve our offerings',
      botId: 'bot2',
      emailList: ['user1@feedback.com', 'user2@feedback.com', 'user3@feedback.com', 'user4@feedback.com'],
      aiPrompt: 'Write a friendly email requesting product feedback. Be appreciative and offer incentives.',
      status: 'completed',
      sentEmails: ['user1@feedback.com', 'user2@feedback.com', 'user3@feedback.com', 'user4@feedback.com'],
      aiMessages: ['ai_message_11', 'ai_message_12', 'ai_message_13', 'ai_message_14'],
      selectedMessageIndex: 1,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-17')
    },
    {
      _id: '7',
      name: 'Event Invitation',
      description: 'Invite customers to our upcoming product launch event',
      botId: 'bot1',
      emailList: ['vip1@event.com', 'vip2@event.com', 'vip3@event.com', 'vip4@event.com', 'vip5@event.com'],
      aiPrompt: 'Create an exclusive event invitation email. Make it feel special and include event details.',
      status: 'paused',
      sentEmails: ['vip1@event.com', 'vip2@event.com'],
      aiMessages: ['ai_message_15', 'ai_message_16'],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-18')
    },
    {
      _id: '8',
      name: 'Renewal Reminder',
      description: 'Remind customers about upcoming subscription renewals',
      botId: 'bot2',
      emailList: ['customer1@renewal.com', 'customer2@renewal.com', 'customer3@renewal.com'],
      aiPrompt: 'Write a professional renewal reminder email. Highlight benefits and provide easy renewal options.',
      status: 'draft',
      sentEmails: [],
      aiMessages: [],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-11'),
      updatedAt: new Date('2024-01-11')
    },
    {
      _id: '9',
      name: 'Feature Announcement',
      description: 'Announce new features to existing customers',
      botId: 'bot3',
      emailList: ['customer1@feature.com', 'customer2@feature.com', 'customer3@feature.com', 'customer4@feature.com', 'customer5@feature.com', 'customer6@feature.com', 'customer7@feature.com'],
      aiPrompt: 'Write an exciting feature announcement email. Show the value and include usage examples.',
      status: 'running',
      sentEmails: ['customer1@feature.com', 'customer2@feature.com', 'customer3@feature.com', 'customer4@feature.com'],
      aiMessages: ['ai_message_17', 'ai_message_18', 'ai_message_19', 'ai_message_20'],
      selectedMessageIndex: 2,
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: '10',
      name: 'Survey Campaign',
      description: 'Send customer satisfaction survey to gather insights',
      botId: 'bot2',
      emailList: ['survey1@customer.com', 'survey2@customer.com', 'survey3@customer.com', 'survey4@customer.com'],
      aiPrompt: 'Create a survey invitation email. Explain the importance and keep it brief.',
      status: 'completed',
      sentEmails: ['survey1@customer.com', 'survey2@customer.com', 'survey3@customer.com', 'survey4@customer.com'],
      aiMessages: ['ai_message_21', 'ai_message_22', 'ai_message_23', 'ai_message_24'],
      selectedMessageIndex: 0,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16')
    }
  ];

  const dummyBots: Bot[] = [
    {
      _id: 'bot1',
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
      dailyEmailLimit: 100,
      emailsSentToday: 45,
      lastEmailSentAt: new Date('2024-01-20T10:30:00Z'),
      performance: {
        totalEmailsSent: 1250,
        openRate: 0.68,
        clickRate: 0.12,
        replyRate: 0.08,
        bounceRate: 0.02
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: 'bot2',
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
      dailyEmailLimit: 50,
      emailsSentToday: 28,
      lastEmailSentAt: new Date('2024-01-20T09:15:00Z'),
      performance: {
        totalEmailsSent: 890,
        openRate: 0.72,
        clickRate: 0.15,
        replyRate: 0.12,
        bounceRate: 0.01
      },
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: 'bot3',
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
      dailyEmailLimit: 200,
      emailsSentToday: 15,
      lastEmailSentAt: new Date('2024-01-19T14:00:00Z'),
      performance: {
        totalEmailsSent: 2100,
        openRate: 0.58,
        clickRate: 0.18,
        replyRate: 0.05,
        bounceRate: 0.03
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-19')
    }
  ];

  // Use dummy data instead of API calls for demonstration
  const campaigns = dummyCampaigns;
  const bots = dummyBots;
  const campaignsLoading = false;
  const botsLoading = false;
  const campaignsError = null;
  const resetCampaigns = () => {};

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  
  // API operations
  const { execute: updateCampaign, loading: updating } = usePut('/campaigns');

  const handlePauseCampaign = async () => {
    if (!pausingCampaign) return;
    
    setIsPausing(true);
    try {
      const newStatus = pausingCampaign.status === 'running' ? 'paused' : 'running';
      const response = await updateCampaign({
        id: pausingCampaign._id,
        status: newStatus
      });
      
      if (response) {
        setIsPauseDialogOpen(false);
        setPausingCampaign(null);
        resetCampaigns();
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    } finally {
      setIsPausing(false);
    }
  };

  const openPauseDialog = (campaign: Campaign) => {
    setPausingCampaign(campaign);
    setIsPauseDialogOpen(true);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (campaignsLoading || botsLoading) {
    return (
      <DashboardLayout title="Campaigns" description="Manage your email campaigns">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Campaigns" 
      description="Manage your email campaigns"
      actions={
        <Button 
          onClick={() => router.push('/dashboard/campaigns/create')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Campaign
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sticky Search and View Controls */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 mb-6">
          <div className="w-full space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns by name or description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full h-12 text-base"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </Button>
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredCampaigns.length} of {campaigns.length} campaigns
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Display */}
        {campaignsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Failed to load campaigns. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        ) : paginatedCampaigns && paginatedCampaigns.length > 0 ? (
          <>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {paginatedCampaigns.map((campaign) => (
                  <Card key={campaign._id} className="relative hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{campaign.name}</h3>
                              <Badge className={`${getStatusColor(campaign.status)} px-2 py-1 text-xs font-medium`}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                              {campaign.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Recipients:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{campaign.emailList.length}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Sent:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{campaign.sentEmails.length}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Created:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {new Date(campaign.createdAt).toLocaleDateString()} {new Date(campaign.createdAt).toLocaleTimeString()}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPauseDialog(campaign)}
                            className={`h-8 px-3 ${
                              campaign.status === 'running' 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-950'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950'
                            }`}
                          >
                            {campaign.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCampaigns.map((campaign) => (
                  <Card key={campaign._id} className="relative hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate block max-w-full">{campaign.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words max-w-full overflow-hidden">
                                {campaign.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(campaign.status)} px-2 py-1 text-xs font-medium flex-shrink-0`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Recipients</span>
                            <span className="font-medium text-gray-900 dark:text-white">{campaign.emailList.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Sent</span>
                            <span className="font-medium text-gray-900 dark:text-white">{campaign.sentEmails.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Created</span>
                            <span className="font-medium text-gray-900 dark:text-white text-right">
                              {new Date(campaign.createdAt).toLocaleDateString()} {new Date(campaign.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`w-full ${
                              campaign.status === 'running' 
                                ? 'hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 dark:hover:border-orange-700 text-orange-600 dark:text-orange-400'
                                : 'hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950 dark:hover:border-green-700 text-green-600 dark:text-green-400'
                            }`}
                            onClick={() => openPauseDialog(campaign)}
                          >
                            {campaign.status === 'running' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {campaign.status === 'running' ? 'Pause' : 'Resume'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 p-0 ${
                            currentPage === page 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first email campaign to get started
                </p>
                <Button onClick={() => router.push('/dashboard/campaigns/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pause/Resume Confirmation Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
              {pausingCampaign?.status === 'running' ? (
                <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              ) : (
                <Play className="w-8 h-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold">
              {pausingCampaign?.status === 'running' ? 'Pause Campaign' : 'Resume Campaign'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {pausingCampaign?.status === 'running' 
                ? `Are you sure you want to pause "${pausingCampaign?.name}"? This will stop the campaign from sending emails.`
                : `Are you sure you want to resume "${pausingCampaign?.name}"? This will continue sending emails from where it left off.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsPauseDialogOpen(false)}
              disabled={isPausing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePauseCampaign} 
              disabled={isPausing}
              className={
                pausingCampaign?.status === 'running'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {isPausing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {pausingCampaign?.status === 'running' ? 'Pausing...' : 'Resuming...'}
                </>
              ) : (
                <>
                  {pausingCampaign?.status === 'running' ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume Campaign
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
