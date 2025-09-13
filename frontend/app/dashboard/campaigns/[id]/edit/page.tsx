'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { ArrowLeft, Bot as BotIcon, Mail, Save, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emailList: [] as string[],
    emailInterval: 0,
    emailIntervalUnit: 'minutes' as 'minutes' | 'hours' | 'days',
    scheduledFor: '',
    status: 'draft' as 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped'
  });

  // Fetch campaign details
  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignsAPI.getCampaign(campaignId);
      
      if (response.success && response.data) {
        const campaignData = response.data;
        setCampaign(campaignData);
        
        // Set form data
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          emailList: campaignData.emailList || [],
          emailInterval: campaignData.emailInterval || 0,
          emailIntervalUnit: campaignData.emailIntervalUnit || 'minutes',
          scheduledFor: campaignData.scheduledFor ? new Date(campaignData.scheduledFor).toISOString().slice(0, 16) : '',
          status: campaignData.status || 'draft'
        });
        
        // Fetch bot details
        const botResponse = await BotsAPI.getBot(campaignData.botId);
        if (botResponse.success && botResponse.data) {
          setBot(botResponse.data);
        }
      } else {
        setError(response.error || 'Failed to fetch campaign details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch campaign details');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, fetchCampaign]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaign) return;

    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        emailList: formData.emailList,
        emailInterval: formData.emailInterval,
        emailIntervalUnit: formData.emailIntervalUnit,
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null,
        status: formData.status
      };

      const response = await CampaignsAPI.updateCampaign(campaign._id, updateData);
      
      if (response.success) {
        toast.success('Campaign updated successfully');
        router.push(`/dashboard/campaigns/${campaign._id}`);
      } else {
        setError(response.error || 'Failed to update campaign');
        toast.error(response.error || 'Failed to update campaign');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle email list changes
  const handleEmailListChange = (value: string) => {
    const emails = value.split('\n').map(email => email.trim()).filter(email => email);
    setFormData(prev => ({ ...prev, emailList: emails }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'stopped':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'draft':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'ready':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            
            {/* Main card skeleton */}
            <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              {/* Card header skeleton */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
              
              {/* Form skeleton */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Email list skeleton */}
              <div className="mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
              </div>
              
              {/* Bot info skeleton */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              
              {/* Submit button skeleton */}
              <div className="flex justify-end mt-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Campaign Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || 'The campaign you are looking for does not exist or has been deleted.'}
                </p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => router.push('/dashboard/campaigns')}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Campaigns
                  </Button>
                  {error && (
                    <Button 
                      onClick={() => fetchCampaign()}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Edit Campaign"
      description={`Edit ${campaign.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Campaign Info Card */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Campaign Information
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Update your campaign details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-blue-700 dark:text-blue-300">Campaign Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-blue-700 dark:text-blue-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter campaign description"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-blue-700 dark:text-blue-300">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="stopped">Stopped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scheduling & Settings */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scheduledFor" className="text-blue-700 dark:text-blue-300">Schedule For</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailInterval" className="text-blue-700 dark:text-blue-300">Email Interval</Label>
                      <Input
                        id="emailInterval"
                        type="number"
                        min="0"
                        value={formData.emailInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailInterval: parseInt(e.target.value) || 0 }))}
                        className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailIntervalUnit" className="text-blue-700 dark:text-blue-300">Unit</Label>
                      <Select
                        value={formData.emailIntervalUnit}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, emailIntervalUnit: value }))}
                      >
                        <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email List */}
              <div>
                <Label htmlFor="emailList" className="text-blue-700 dark:text-blue-300">Email Recipients</Label>
                <Textarea
                  id="emailList"
                  value={formData.emailList.join('\n')}
                  onChange={(e) => handleEmailListChange(e.target.value)}
                  placeholder="Enter email addresses, one per line"
                  className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500 font-mono text-sm"
                  rows={6}
                />
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  {formData.emailList.length} recipient(s) added
                </p>
              </div>

              {/* Bot Information */}
              {bot && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BotIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Associated Bot</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p><strong>Name:</strong> {bot.name}</p>
                    <p><strong>Email:</strong> {bot.email}</p>
                    <Badge className={`ml-2 ${getStatusColor(bot.isActive ? 'active' : 'inactive')}`}>
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
