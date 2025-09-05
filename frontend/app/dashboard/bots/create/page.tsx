'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot as BotIcon, Check, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateBotPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');

  const handleVerifyCredentials = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setVerificationStatus('error');
      setVerificationMessage('Please enter both email and password');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    setVerificationMessage('');

    try {
      const response = await fetch('/api/bots/test-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        setVerificationMessage('Credentials verified successfully!');
      } else {
        setVerificationStatus('error');
        setVerificationMessage(result.message || 'Failed to verify credentials');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setVerificationMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.length > 50 || formData.description.length > 200) {
      return;
    }

    if (verificationStatus !== 'success') {
      setVerificationStatus('error');
      setVerificationMessage('Please verify your email credentials before creating the bot');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect back to bots page
        router.push('/dashboard/bots');
      } else {
        console.error('Failed to create bot:', result.message);
        setVerificationStatus('error');
        setVerificationMessage(result.message || 'Failed to create bot');
      }
    } catch (error) {
      console.error('Failed to create bot:', error);
      setVerificationStatus('error');
      setVerificationMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && 
                     formData.name.length <= 50 && 
                     formData.description.length <= 200 &&
                     formData.email.trim() &&
                     formData.password.trim() &&
                     verificationStatus === 'success';

  return (
    <DashboardLayout
      title="Create Bot"
      description="Create a new email bot for your campaigns"
      actions={
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/bots')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bots
        </Button>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BotIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Bot</CardTitle>
                <CardDescription>
                  Set up a new email bot with custom configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Bot Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter bot name (max 50 characters)"
                    maxLength={50}
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Bot name should be descriptive and unique</span>
                    <span className={formData.name.length > 45 ? 'text-orange-500' : ''}>
                      {formData.name.length}/50
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Bot Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="bot@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this bot does (max 200 characters)"
                  rows={3}
                  maxLength={200}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Brief description of the bot's purpose</span>
                  <span className={formData.description.length > 180 ? 'text-orange-500' : ''}>
                    {formData.description.length}/200
                  </span>
                </div>
              </div>

              {/* Profile Image Preview */}
              {formData.name.trim() && (
                <div className="space-y-3">
                  <Label>Profile Image Preview</Label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="relative">
                      <img
                        src={`https://robohash.org/${encodeURIComponent(formData.name)}?set=set3&size=200x200`}
                        alt={`${formData.name} avatar`}
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <BotIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        This unique robot avatar will be generated automatically based on your bot's name using RoboHash.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Email Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      // Reset verification status when password changes
                      if (verificationStatus !== 'idle') {
                        setVerificationStatus('idle');
                        setVerificationMessage('');
                      }
                    }}
                    placeholder="Enter email password"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyCredentials}
                    disabled={isVerifying || !formData.email.trim() || !formData.password.trim()}
                    className="px-4"
                  >
                    {isVerifying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : verificationStatus === 'success' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : verificationStatus === 'error' ? (
                      <X className="h-4 w-4 text-red-600" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                
                {/* Verification Status */}
                {verificationMessage && (
                  <div className={`text-sm p-2 rounded-md ${
                    verificationStatus === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : verificationStatus === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {verificationMessage}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/bots')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Bot
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
