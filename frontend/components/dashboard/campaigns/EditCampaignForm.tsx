'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from '@/types';
import { BotIcon, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditCampaignFormProps {
  formData: {
    name: string;
    description: string;
    emailList: string[];
    emailInterval: number;
    emailIntervalUnit: 'minutes' | 'hours' | 'days';
    scheduledFor: string;
    status: 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    emailList: string[];
    emailInterval: number;
    emailIntervalUnit: 'minutes' | 'hours' | 'days';
    scheduledFor: string;
    status: 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped';
  }>>;
  handleEmailListChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  bot: Bot | null;
  getStatusColor: (status: string) => string;
}

export function EditCampaignForm({
  formData,
  setFormData,
  handleEmailListChange,
  handleSubmit,
  saving,
  bot,
  getStatusColor
}: EditCampaignFormProps) {
  return (
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
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
