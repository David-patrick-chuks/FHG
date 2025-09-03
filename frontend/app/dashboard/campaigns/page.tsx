'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDelete, useGet, usePost, usePut } from '@/hooks/useApi';
import { Bot, Campaign } from '@/types';
import { BarChart3, Calendar, Edit, Eye, Mail, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function CampaignsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    botId: '',
    emailList: '',
    aiPrompt: ''
  });

  // Fetch data
  const { data: campaigns, loading: campaignsLoading, error: campaignsError, reset: resetCampaigns } = useGet<Campaign[]>('/campaigns');
  const { data: bots, loading: botsLoading } = useGet<Bot[]>('/bots');
  
  // API operations
  const { execute: createCampaign, loading: creating } = usePost('/campaigns');
  const { execute: updateCampaign, loading: updating } = usePut('/campaigns');
  const { execute: deleteCampaign, loading: deleting } = useDelete('/campaigns');

  const handleCreateCampaign = async () => {
    try {
      const emailList = formData.emailList.split('\n').filter(email => email.trim());
      const response = await createCampaign({
        name: formData.name,
        description: formData.description,
        botId: formData.botId,
        emailList,
        aiPrompt: formData.aiPrompt
      });
      
      if (response) {
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '', botId: '', emailList: '', aiPrompt: '' });
        resetCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleEditCampaign = async () => {
    if (!editingCampaign) return;
    
    try {
      const emailList = formData.emailList.split('\n').filter(email => email.trim());
      const response = await updateCampaign({
        id: editingCampaign._id,
        name: formData.name,
        description: formData.description,
        botId: formData.botId,
        emailList,
        aiPrompt: formData.aiPrompt
      });
      
      if (response) {
        setIsEditDialogOpen(false);
        setEditingCampaign(null);
        setFormData({ name: '', description: '', botId: '', emailList: '', aiPrompt: '' });
        resetCampaigns();
      }
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(`/campaigns/${campaignId}`);
        resetCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      botId: campaign.botId,
      emailList: campaign.targetAudience.emails.join('\n'),
      aiPrompt: campaign.template.aiPrompt || ''
    });
    setIsEditDialogOpen(true);
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
    <DashboardLayout title="Campaigns" description="Manage your email campaigns">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage your email campaigns</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new email campaign with your AI bot</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign"
                  />
                </div>
                <div>
                  <Label htmlFor="botId">Select Bot</Label>
                  <Select value={formData.botId} onValueChange={(value) => setFormData({ ...formData, botId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a bot" />
                    </SelectTrigger>
                    <SelectContent>
                      {bots?.map((bot) => (
                        <SelectItem key={bot._id} value={bot._id}>
                          {bot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emailList">Email List (one per line)</Label>
                  <Textarea
                    id="emailList"
                    value={formData.emailList}
                    onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                    placeholder="Enter email addresses, one per line"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="aiPrompt">AI Prompt (optional)</Label>
                  <Textarea
                    id="aiPrompt"
                    value={formData.aiPrompt}
                    onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                    placeholder="Describe the type of email you want the AI to generate"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        {campaignsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Failed to load campaigns. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {campaign.description || 'No description'}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{campaign.targetAudience.emails.length} recipients</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span>{campaign.stats.sentEmails} sent</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{campaign.template.aiGenerated ? 'AI Generated' : 'Manual'} template</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(campaign)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update your campaign settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Campaign Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign"
              />
            </div>
            <div>
              <Label htmlFor="edit-botId">Select Bot</Label>
              <Select value={formData.botId} onValueChange={(value) => setFormData({ ...formData, botId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bot" />
                </SelectTrigger>
                <SelectContent>
                  {bots?.map((bot) => (
                    <SelectItem key={bot._id} value={bot._id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-emailList">Email List (one per line)</Label>
              <Textarea
                id="edit-emailList"
                value={formData.emailList}
                onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                placeholder="Enter email addresses, one per line"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-aiPrompt">AI Prompt (optional)</Label>
              <Textarea
                id="edit-aiPrompt"
                value={formData.aiPrompt}
                onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                placeholder="Describe the type of email you want the AI to generate"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCampaign} disabled={updating}>
                {updating ? 'Updating...' : 'Update Campaign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
