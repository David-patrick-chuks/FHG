'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractorAPI } from '@/lib/api/email-extractor';
import { Crown, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { SubscriptionInfo } from './types';

interface EmailExtractorFormProps {
  subscriptionInfo: SubscriptionInfo | null;
  onExtractionStart: (urls: string[], extractionType: 'single' | 'multiple' | 'csv') => void;
  isLoading: boolean;
}

export function EmailExtractorForm({ 
  subscriptionInfo, 
  onExtractionStart, 
  isLoading 
}: EmailExtractorFormProps) {
  const [singleUrl, setSingleUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSingleUrlExtraction = () => {
    if (!singleUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL',
        variant: 'destructive'
      });
      return;
    }

    // Check limits
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.usage.limit} extractions. Please upgrade your plan.`,
        variant: 'destructive'
      });
      return;
    }

    onExtractionStart([singleUrl.trim()], 'single');
  };

  const handleMultipleUrlsExtraction = () => {
    const urls = multipleUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one website URL',
        variant: 'destructive'
      });
      return;
    }

    // Check limits
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.usage.limit} extractions. Please upgrade your plan.`,
        variant: 'destructive'
      });
      return;
    }

    onExtractionStart(urls, 'multiple');
  };

  const handleCsvFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!subscriptionInfo?.canUseCsv) {
      toast({
        title: 'CSV Upload Not Available',
        description: 'CSV upload is not available in your current plan. Please upgrade to use this feature.',
        variant: 'destructive'
      });
      return;
    }

    setCsvFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await EmailExtractorAPI.parseCsvFile(formData);
      if (response.success && response.data) {
        setParsedUrls(response.data.urls);
        toast({
          title: 'Success',
          description: `Parsed ${response.data.urls.length} URLs from CSV file`
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to parse CSV file',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse CSV file',
        variant: 'destructive'
      });
    }
  };

  const handleCsvExtraction = () => {
    if (parsedUrls.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload a CSV file first',
        variant: 'destructive'
      });
      return;
    }

    // Check limits
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.usage.limit} extractions. Please upgrade your plan.`,
        variant: 'destructive'
      });
      return;
    }

    onExtractionStart(parsedUrls, 'csv');
  };

  const isLimitReached = subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited;

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger 
          value="single" 
          disabled={isLimitReached}
          className="flex items-center gap-2"
        >
          Single URL
          {isLimitReached && <Crown className="h-4 w-4" />}
        </TabsTrigger>
        <TabsTrigger 
          value="multiple" 
          disabled={isLimitReached}
          className="flex items-center gap-2"
        >
          Multiple URLs
          {isLimitReached && <Crown className="h-4 w-4" />}
        </TabsTrigger>
        <TabsTrigger 
          value="csv" 
          disabled={!subscriptionInfo?.canUseCsv}
          className="flex items-center gap-2"
        >
          CSV Upload
          {!subscriptionInfo?.canUseCsv && <Crown className="h-4 w-4" />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="space-y-4">
        {isLimitReached ? (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-gray-600 mb-4">
              You've reached your daily extraction limit. Upgrade your plan to continue extracting emails.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="single-url">Website URL</Label>
              <Input
                id="single-url"
                type="text"
                placeholder="https://example.com"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a website URL (https:// will be added automatically if missing)
              </p>
            </div>
            <Button 
              onClick={handleSingleUrlExtraction} 
              disabled={isLoading || !singleUrl.trim()}
              className="w-full"
            >
              {isLoading ? 'Starting Extraction...' : 'Extract Emails'}
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="multiple" className="space-y-4">
        {isLimitReached ? (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-gray-600 mb-4">
              You've reached your daily extraction limit. Upgrade your plan to continue extracting emails.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="multiple-urls">Website URLs (one per line)</Label>
              <Textarea
                id="multiple-urls"
                placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                value={multipleUrls}
                onChange={(e) => setMultipleUrls(e.target.value)}
                className="mt-1 min-h-[120px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter multiple website URLs, one per line (https:// will be added automatically if missing)
              </p>
            </div>
            <Button 
              onClick={handleMultipleUrlsExtraction} 
              disabled={isLoading || !multipleUrls.trim()}
              className="w-full"
            >
              {isLoading ? 'Starting Extraction...' : 'Extract Emails'}
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="csv" className="space-y-4">
        {!subscriptionInfo?.canUseCsv ? (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">CSV Upload Not Available</h3>
            <p className="text-gray-600 mb-4">
              CSV upload is only available in Pro and Enterprise plans. Upgrade to use this feature.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                  aria-label="CSV file upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {csvFile ? csvFile.name : 'Choose CSV File'}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file with website URLs in the first column
              </p>
            </div>

            {parsedUrls.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Found {parsedUrls.length} URLs in CSV file:
                </p>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {parsedUrls.slice(0, 10).map((url, index) => (
                      <li key={index} className="truncate">{url}</li>
                    ))}
                    {parsedUrls.length > 10 && (
                      <li className="text-gray-500">... and {parsedUrls.length - 10} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <Button 
              onClick={handleCsvExtraction} 
              disabled={isLoading || parsedUrls.length === 0}
              className="w-full"
            >
              {isLoading ? 'Starting Extraction...' : 'Extract Emails'}
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
