'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CookieAPI } from '@/lib/api';
import {
    getCookiePreferences,
    hasConsent,
    setCookieConsent,
    shouldShowCookieBanner,
    type CookiePreferences
} from '@/lib/cookies';
import { Cookie, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'accept' | 'reject' | 'customize' | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if banner should be shown
    const shouldShow = shouldShowCookieBanner();
    setIsVisible(shouldShow);
    
    // Load current preferences
    const currentPreferences = getCookiePreferences();
    setPreferences(currentPreferences);
  }, []);

  // Hide banner immediately if consent is already given
  useEffect(() => {
    if (hasConsent()) {
      setIsVisible(false);
    }
  }, []);

  const handleAcceptAll = async () => {
    if (isLoading) return; // Prevent duplicate requests
    
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    setIsLoading(true);
    setLoadingAction('accept');
    try {
      await CookieAPI.setCookieConsent(allAccepted);
      setCookieConsent(allAccepted);
      setIsVisible(false);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
      // Fallback to local storage only
      setCookieConsent(allAccepted);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleAcceptSelected = async () => {
    if (isLoading) return; // Prevent duplicate requests
    
    setIsLoading(true);
    setLoadingAction('customize');
    try {
      await CookieAPI.setCookieConsent(preferences);
      setCookieConsent(preferences);
      setIsVisible(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
      // Fallback to local storage only
      setCookieConsent(preferences);
      setIsVisible(false);
      setShowSettings(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleRejectAll = async () => {
    if (isLoading) return; // Prevent duplicate requests
    
    const minimal: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    
    setIsLoading(true);
    setLoadingAction('reject');
    try {
      await CookieAPI.setCookieConsent(minimal);
      setCookieConsent(minimal);
      setIsVisible(false);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
      // Fallback to local storage only
      setCookieConsent(minimal);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, checked: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md animate-in slide-in-from-right-4 duration-1000">
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardContent className="px-3">
            {!showSettings ? (
              // Main banner
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      We use cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-center">
                      We use cookies to enhance your experience and improve our services. 
                      Essential cookies are required for the site to function.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-2 text-center">
                      Learn more in our{' '}
                      <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Cookie Policy
                      </Link>.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex">
                    <Button 
                      onClick={handleAcceptAll}
                      disabled={isLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex-1 mr-1"
                    >
                      {loadingAction === 'accept' ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button 
                      onClick={handleRejectAll}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 flex-1 ml-1"
                    >
                      {loadingAction === 'reject' ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                  <Button 
                    onClick={() => setShowSettings(true)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 disabled:opacity-50 w-full"
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>
            ) : (
              // Settings panel
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Cookie Preferences
                  </h3>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Essential Cookies */}
                  <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="essential"
                      checked={preferences.essential}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="essential" className="font-medium text-gray-900 dark:text-white text-sm">
                        Essential Cookies
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Required for website functionality. Cannot be disabled.
                      </p>
                    </div>
                  </div>
                  
                  {/* Functional Cookies */}
                  <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="functional"
                      checked={preferences.functional}
                      onCheckedChange={(checked) => handlePreferenceChange('functional', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="functional" className="font-medium text-gray-900 dark:text-white text-sm">
                        Functional Cookies
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Enhanced functionality and personalization features.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => handlePreferenceChange('analytics', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="font-medium text-gray-900 dark:text-white text-sm">
                        Analytics Cookies
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Help us understand usage and improve our services.
                      </p>
                    </div>
                  </div>
                  
                  {/* Marketing Cookies */}
                  <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => handlePreferenceChange('marketing', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="marketing" className="font-medium text-gray-900 dark:text-white text-sm">
                        Marketing Cookies
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Deliver relevant ads and measure campaign effectiveness.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={handleAcceptSelected}
                    disabled={isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {loadingAction === 'customize' ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAcceptAll}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 disabled:opacity-50 flex-1"
                    >
                      {loadingAction === 'accept' ? 'Processing...' : 'Accept All'}
                    </Button>
                    <Button 
                      onClick={handleRejectAll}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 flex-1 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
                    >
                      {loadingAction === 'reject' ? 'Processing...' : 'Reject All'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
