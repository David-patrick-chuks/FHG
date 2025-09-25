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
    templateId?: string;
    botId?: string;
    timezone?: string;
    businessHoursOnly?: boolean;
    customIntervals?: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    emailList: string[];
    emailInterval: number;
    emailIntervalUnit: 'minutes' | 'hours' | 'days';
    scheduledFor: string;
    status: 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped';
    templateId?: string;
    botId?: string;
    timezone?: string;
    businessHoursOnly?: boolean;
    customIntervals?: boolean;
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
      {/* Status Warning for Running Campaigns */}
      {formData.status === 'running' && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              Campaign is currently running
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Only basic settings and email list can be modified while the campaign is running. 
            Template and bot changes are not allowed.
          </p>
        </div>
      )}
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

          {/* Advanced Scheduling Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="timezone" className="text-blue-700 dark:text-blue-300">Timezone</Label>
              <Select
                value={formData.timezone || 'UTC'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="businessHoursOnly"
                checked={formData.businessHoursOnly || false}
                onChange={(e) => setFormData(prev => ({ ...prev, businessHoursOnly: e.target.checked }))}
                className="rounded border-blue-200 focus:border-blue-400"
                aria-label="Send emails only during business hours"
              />
              <Label htmlFor="businessHoursOnly" className="text-blue-700 dark:text-blue-300">
                Send emails only during business hours (9 AM - 5 PM)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customIntervals"
                checked={formData.customIntervals || false}
                onChange={(e) => setFormData(prev => ({ ...prev, customIntervals: e.target.checked }))}
                className="rounded border-blue-200 focus:border-blue-400"
                aria-label="Use custom intervals"
              />
              <Label htmlFor="customIntervals" className="text-blue-700 dark:text-blue-300">
                Use custom intervals (advanced)
              </Label>
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
        
        {/* Bulk Email Operations */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Import emails from clipboard
                navigator.clipboard.readText().then(text => {
                  const emails = text.split(/[\n,;]/).map(email => email.trim()).filter(email => email);
                  setFormData(prev => ({
                    ...prev,
                    emailList: [...new Set([...prev.emailList, ...emails])]
                  }));
                });
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              Import from Clipboard
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Export emails to clipboard
                navigator.clipboard.writeText(formData.emailList.join('\n'));
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              Export to Clipboard
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Remove duplicates
                setFormData(prev => ({
                  ...prev,
                  emailList: [...new Set(prev.emailList)]
                }));
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              Remove Duplicates
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Validate emails
                const invalidEmails = formData.emailList.filter(email => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return !emailRegex.test(email);
                });
                
                if (invalidEmails.length > 0) {
                  alert(`Invalid emails found: ${invalidEmails.join(', ')}`);
                } else {
                  alert('All emails are valid!');
                }
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              Validate Emails
            </Button>
          </div>
        </div>
      </div>

      {/* Template and Bot Selection (for draft campaigns only) */}
      {formData.status === 'draft' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateId" className="text-blue-700 dark:text-blue-300">Email Template</Label>
            <Select
              value={formData.templateId || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template1">Professional Outreach</SelectItem>
                <SelectItem value="template2">Follow-up Template</SelectItem>
                <SelectItem value="template3">Cold Email Template</SelectItem>
                {/* TODO: Load actual templates from API */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="botId" className="text-blue-700 dark:text-blue-300">Email Bot</Label>
            <Select
              value={formData.botId || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, botId: value }))}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500">
                <SelectValue placeholder="Select a bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bot1">David's Bot</SelectItem>
                <SelectItem value="bot2">Marketing Bot</SelectItem>
                <SelectItem value="bot3">Sales Bot</SelectItem>
                {/* TODO: Load actual bots from API */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="regenerateMessages"
              className="rounded border-blue-200 focus:border-blue-400"
              aria-label="Regenerate AI messages when template/bot changes"
            />
            <Label htmlFor="regenerateMessages" className="text-blue-700 dark:text-blue-300">
              Regenerate AI messages when template/bot changes
            </Label>
          </div>
        </div>
      )}

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
