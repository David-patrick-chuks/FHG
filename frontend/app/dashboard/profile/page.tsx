'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountDetails, ApiKeyManagement, PlanFeatures, ProfileInformation } from '@/components/profile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { AlertCircle, CheckCircle, CreditCard, Key, Shield, User as UserIcon } from 'lucide-react';
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
  
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  // Fetch API key info and usage
  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        // Use user data directly if available, otherwise fetch from API
        const userWithApiKey = user as any;
        if (userWithApiKey?.apiKey) {
          setApiKeyInfo({
            hasApiKey: true,
            apiKey: userWithApiKey.apiKey, // Show full API key, not masked
            createdAt: userWithApiKey.apiKeyCreatedAt?.toString() || null,
            lastUsed: userWithApiKey.apiKeyLastUsed?.toString() || null
          });
        } else {
          // Fallback to API call if user data doesn't have API key info
          const keyResponse = await apiClient.get<ApiKeyInfo>('/api-keys/info');
          if (keyResponse.success && keyResponse.data) {
            setApiKeyInfo((keyResponse.data as any).data);
          }
        }

        // Fetch usage info
        const usageResponse = await apiClient.get<ApiUsage>('/email-extractor/subscription-info');
        if (usageResponse.success && usageResponse.data) {
          setApiUsage((usageResponse.data as any).data);
        }
      } catch (error) {
        console.error('Failed to fetch API info:', error);
      }
    };

    if (user) {
      fetchApiInfo();
    }
  }, [user]);

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.put<User>('/auth/profile', data);
      
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
      const response = await apiClient.post<{ apiKey: string; createdAt: string; lastUsed: string | null }>('/api-keys/generate');
      
      if (response.success && response.data) {
        setGeneratedApiKey(response.data.apiKey);
        setApiKeyInfo({
          hasApiKey: true,
          apiKey: response.data.apiKey,
          createdAt: response.data.createdAt,
          lastUsed: response.data.lastUsed
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
    }
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
              <ProfileInformation
                user={user}
                onProfileUpdate={handleProfileUpdate}
                isLoading={isLoading}
              />
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
            <CardContent>
              <AccountDetails user={user} />
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
          <CardContent>
            <ApiKeyManagement
              apiKeyInfo={apiKeyInfo}
              apiUsage={apiUsage}
              generatedApiKey={generatedApiKey}
              isGeneratingKey={isGeneratingKey}
              onGenerateApiKey={handleGenerateApiKey}
              onCopyToClipboard={copyToClipboard}
            />
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
            <PlanFeatures user={user} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}