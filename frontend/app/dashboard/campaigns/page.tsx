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
import { BarChart3, Calendar, Edit, Eye, Mail, Plus, Trash2, Upload, Users, X } from 'lucide-react';
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
  const [uploadedEmails, setUploadedEmails] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
        setUploadedEmails([]);
        setUploadedFileName('');
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
        setUploadedEmails([]);
        setUploadedFileName('');
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['text/csv', 'text/plain'].includes(file.type)) {
      alert('Please upload a CSV or text file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/campaigns/upload-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedEmails(result.data.emails);
        setUploadedFileName(result.data.fileName);
        // Update the email list in the form
        setFormData(prev => ({ ...prev, emailList: result.data.emails.join('\n') }));
        
        if (result.data.invalidEmails.length > 0) {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails and ${result.data.invalidEmails.length} invalid emails.`);
        } else {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails.`);
        }
      } else {
        alert(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadedEmails = () => {
    setUploadedEmails([]);
    setUploadedFileName('');
    setFormData(prev => ({ ...prev, emailList: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        handleFileUpload({ target: { files: [file] } } as any);
      }
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      botId: campaign.botId,
      emailList: campaign.emailList.join('\n'),
      aiPrompt: campaign.aiPrompt || ''
    });
    // Set uploaded emails state for edit mode
    setUploadedEmails(campaign.emailList);
    setUploadedFileName(`Campaign: ${campaign.name}`);
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
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Create and manage your email campaigns</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-5 h-5 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center border-b border-gray-200 pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Campaign
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 mt-2">
                  Build your email campaign step by step
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 pt-6">
                {/* Step 1: Campaign Basics */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Campaign Basics</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                        Campaign Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Q1 Sales Outreach"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="botId" className="text-sm font-medium text-gray-700 flex items-center">
                        Select Bot <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select value={formData.botId} onValueChange={(value) => setFormData({ ...formData, botId: value })}>
                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base">
                          <SelectValue placeholder="Choose your AI email bot" />
                        </SelectTrigger>
                        <SelectContent>
                          {bots?.map((bot) => (
                            <SelectItem key={bot._id} value={bot._id}>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>{bot.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Campaign Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your campaign goals, target audience, and what you want to achieve..."
                      rows={3}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
                {/* Step 2: Target Audience */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="space-y-6">
                      {/* File Upload Section */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="text-base font-medium text-gray-900 mb-2">Upload Email List</h4>
                          <p className="text-sm text-gray-600">Choose your preferred method to add recipients</p>
                        </div>
                        
                        <div className="space-y-4">
                      <div 
                        className={`border-2 border-dashed transition-all duration-200 rounded-xl p-6 text-center ${
                          isDragOver 
                            ? 'border-blue-500 bg-blue-50/80 scale-105' 
                            : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="fileUpload"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label htmlFor="fileUpload" className="cursor-pointer block">
                          {isUploading ? (
                            <div className="space-y-3">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-sm font-medium text-blue-600">Processing your file...</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-900">
                                  Upload Email List
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {isDragOver ? 'Drop your file here!' : 'Drag and drop your file here, or click to browse'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Supports CSV and text files up to 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* File Type Info */}
                      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>CSV files</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Text files</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Max 5MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded File Info */}
                    {uploadedFileName && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Upload className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-900">
                                {uploadedFileName}
                              </p>
                              <p className="text-xs text-green-700">
                                {uploadedEmails.length} valid emails extracted
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearUploadedEmails}
                            className="text-green-600 hover:text-green-800 hover:bg-green-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>

                    {/* Manual Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="emailList" className="text-sm font-medium text-gray-700">
                        Enter emails manually
                      </Label>
                      <Textarea
                        id="emailList"
                        value={formData.emailList}
                        onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                        placeholder="Enter email addresses, one per line&#10;example@domain.com&#10;another@domain.com"
                        rows={4}
                        className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">
                        Type or paste email addresses, one per line
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiPrompt" className="text-sm font-medium text-gray-700">AI Prompt (optional)</Label>
                  <Textarea
                    id="aiPrompt"
                    value={formData.aiPrompt}
                    onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                    placeholder="Describe the type of email you want the AI to generate&#10;Example: Write a professional email introducing our new product to potential customers"
                    rows={3}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Provide context about your audience and desired email style
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign} 
                    disabled={creating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                      </>
                    )}
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
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(campaign.status)} px-3 py-1 text-xs font-medium`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      {campaign.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                          {campaign.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{campaign.emailList.length}</p>
                            <p className="text-xs text-gray-500">Recipients</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{campaign.sentEmails.length}</p>
                            <p className="text-xs text-gray-500">Sent</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {campaign.aiMessages.length > 0 ? 'AI' : 'Manual'}
                            </p>
                            <p className="text-xs text-gray-500">Template</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {campaign.aiPrompt ? 'Custom' : 'Default'}
                            </p>
                            <p className="text-xs text-gray-500">Prompt</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditDialog(campaign)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="Edit Campaign"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-green-50 hover:text-green-600"
                        title="View Campaign"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className="hover:bg-red-50 hover:text-red-600"
                        title="Delete Campaign"
                      >
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
              <Label htmlFor="edit-emailList" className="text-base font-medium">Email List</Label>
              <div className="space-y-4">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <div 
                    className={`border-2 border-dashed transition-all duration-200 rounded-xl p-6 text-center ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50/80 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="editFileUpload"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label htmlFor="editFileUpload" className="cursor-pointer block">
                      {isUploading ? (
                        <div className="space-y-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm font-medium text-blue-600">Processing your file...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-600" />
                          </div>
                                                        <div>
                                <p className="text-base font-semibold text-gray-900">
                                  Update Email List
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {isDragOver ? 'Drop your file here!' : 'Upload a new file to replace current emails'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Supports CSV and text files up to 5MB
                                </p>
                              </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* File Type Info */}
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>CSV files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Text files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Max 5MB</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded File Info */}
                {uploadedFileName && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Upload className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {uploadedFileName}
                          </p>
                          <p className="text-xs text-green-700">
                            {uploadedEmails.length} valid emails extracted
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearUploadedEmails}
                        className="text-green-600 hover:text-green-800 hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Manual Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="edit-emailList" className="text-sm font-medium text-gray-700">
                    Edit emails manually
                  </Label>
                  <Textarea
                    id="edit-emailList"
                    value={formData.emailList}
                    onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                    placeholder="Enter email addresses, one per line&#10;example@domain.com&#10;another@domain.com"
                    rows={4}
                    className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Type or paste email addresses, one per line
                  </p>
                </div>
              </div>
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
