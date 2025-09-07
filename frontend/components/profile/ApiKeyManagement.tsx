'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Copy, Key, RefreshCw } from 'lucide-react';

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

interface ApiKeyManagementProps {
  apiKeyInfo: ApiKeyInfo | null;
  apiUsage: ApiUsage | null;
  generatedApiKey: string | null;
  isGeneratingKey: boolean;
  onGenerateApiKey: () => Promise<void>;
  onCopyToClipboard: (text: string) => Promise<void>;
}

export function ApiKeyManagement({
  apiKeyInfo,
  apiUsage,
  generatedApiKey,
  isGeneratingKey,
  onGenerateApiKey,
  onCopyToClipboard
}: ApiKeyManagementProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {!apiKeyInfo?.hasApiKey ? (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No API Key Generated
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate an API key to access our email extraction service programmatically.
          </p>
          <Button 
            onClick={onGenerateApiKey}
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
                  onClick={() => onCopyToClipboard(generatedApiKey)}
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
                  onClick={onGenerateApiKey}
                  disabled={isGeneratingKey}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {isGeneratingKey && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              {/* Show masked API key */}
              {apiKeyInfo.apiKey && (
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={apiKeyInfo.apiKey}
                      readOnly
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyToClipboard(apiKeyInfo.apiKey!)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is a masked version of your API key for security reasons
                  </p>
                </div>
              )}

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
    </div>
  );
}
