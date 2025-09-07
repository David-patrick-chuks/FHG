'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import {
    AlertCircle,
    AtSign,
    Calendar,
    CheckCircle,
    Copy,
    CreditCard,
    Key,
    Mail,
    RefreshCw,
    Shield,
    User as UserIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProfileFormData {
  username: string;
}

interface ApiKeyInfo {
  hasApiKey: boolean;
  apiKey: string | null;
  createdAt: string | null;
  lastUsed: string | null;
}

interface ApiUsage {
  limits: {
    dailyExtractionLimit: number;
    canUseCsvUpload: boolean;
    planName: string;
    isUnlimited: boolean;
  };
  usage: {
    used: number;
    remaining: number;
    resetTime: string;
    limit: number;
  };
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.username || ''
  });

  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isRevokingKey, setIsRevokingKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || ''
      });
    }
  }, [user]);

  // Fetch API key info and usage
  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        const [keyResponse, usageResponse] = await Promise.all([
          apiClient.get<{ data: ApiKeyInfo }>('/api-keys/info'),
          apiClient.get<{ data: ApiUsage }>('/api/v1/usage')
        ]);

        if (keyResponse.success && keyResponse.data) {
          setApiKeyInfo(keyResponse.data);
        }

        if (usageResponse.success && usageResponse.data) {
          setApiUsage(usageResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch API info:', error);
      }
    };

    fetchApiInfo();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.put<User>('/auth/profile', profileForm);
      
      if (response.success && response.data) {
        updateUser(response.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsGeneratingKey(true);
    setMessage(null);

    try {
      const response = await apiClient.post<{ data: { apiKey: string; createdAt: string } }>('/api-keys/generate');
      
      if (response.success && response.data) {
        setGeneratedApiKey(response.data.apiKey);
        setApiKeyInfo({
          hasApiKey: true,
          apiKey: response.data.apiKey,
          createdAt: response.data.createdAt,
          lastUsed: null
        });
        setMessage({ type: 'success', text: 'API key generated successfully! Copy it now - you won\'t be able to see it again.' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to generate API key' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate API key';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeApiKey = async () => {
    setIsRevokingKey(true);
    setMessage(null);

    try {
      const response = await apiClient.delete('/api-keys/revoke');
      
      if (response.success) {
        setApiKeyInfo({
          hasApiKey: false,
          apiKey: null,
          createdAt: null,
          lastUsed: null
        });
        setGeneratedApiKey(null);
        setMessage({ type: 'success', text: 'API key revoked successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to revoke API key' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke API key';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsRevokingKey(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PRO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile Settings"
      description="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your profile information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="Enter username"
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_]+"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Username can only contain letters, numbers, and underscores
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your account status and subscription information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <Badge className={getSubscriptionColor(user.subscription)}>
                  {user.subscription.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(user.createdAt)}</span>
                </div>
              </div>

              {user.subscription?.toUpperCase() !== 'FREE' && (
                <div className="space-y-2">
                  <Label>Plan Expires</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Contact support for expiry details</span>
                  </div>
                </div>
              )}

              {user.lastLoginAt && (
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(user.lastLoginAt)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Generate and manage your API key for programmatic access to email extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!apiKeyInfo?.hasApiKey && !generatedApiKey ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No API Key Generated
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generate an API key to access our email extraction service programmatically.
                </p>
                <Button 
                  onClick={handleGenerateApiKey}
                  disabled={isGeneratingKey}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingKey && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  <Key className="mr-2 h-4 w-4" />
                  Generate API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated API Key Display */}
                {generatedApiKey && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        API Key Generated Successfully!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      Copy your API key now - you won't be able to see it again for security reasons.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={generatedApiKey}
                        readOnly
                        className="font-mono text-sm bg-white dark:bg-gray-800"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generatedApiKey)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* API Key Info */}
                {apiKeyInfo?.hasApiKey && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">API Key Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeApiKey}
                        disabled={isRevokingKey}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isRevokingKey && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>

                    {apiKeyInfo.createdAt && (
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(apiKeyInfo.createdAt)}
                        </p>
                      </div>
                    )}

                    {apiKeyInfo.lastUsed && (
                      <div>
                        <Label className="text-sm font-medium">Last Used</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(apiKeyInfo.lastUsed)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* API Usage Stats */}
                {apiUsage && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">API Usage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {apiUsage.usage.used}
                        </div>
                        <div className="text-sm text-gray-600">Used Today</div>
                      </div>
                      
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {apiUsage.usage.remaining}
                        </div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                      
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {apiUsage.limits.isUnlimited ? '∞' : apiUsage.limits.dailyExtractionLimit}
                        </div>
                        <div className="text-sm text-gray-600">Daily Limit</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Usage Progress</span>
                        <span>{Math.round((apiUsage.usage.used / apiUsage.usage.limit) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((apiUsage.usage.used / apiUsage.usage.limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plan Features
                </CardTitle>
                <CardDescription>
                  Your current plan limits and capabilities
                </CardDescription>
              </div>
              <Button 
                onClick={() => window.open('/pricing', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user.subscription === 'ENTERPRISE' ? '∞' : 
                   user.subscription === 'PRO' ? '50' : '2'}
                </div>
                <div className="text-sm text-gray-600">Bots</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {user.subscription === 'ENTERPRISE' ? '∞' : 
                   user.subscription === 'PRO' ? '5000' : '1000'}
                </div>
                <div className="text-sm text-gray-600">Daily Emails</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {user.subscription === 'ENTERPRISE' ? '∞' : 
                   user.subscription === 'PRO' ? '50' : '2'}
                </div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
            </div>

            {user.subscription === 'FREE' && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Upgrade Your Plan
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Get more bots, higher email limits, and advanced features with our Pro or Enterprise plans.
                </p>
                <Button 
                  onClick={() => window.open('/pricing', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
