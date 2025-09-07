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
    }
  };

  const handleAcceptSelected = async () => {
    if (isLoading) return; // Prevent duplicate requests
    
    setIsLoading(true);
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
          <CardContent className="p-6">
            {!showSettings ? (
              // Main banner
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      We use cookies to provide you with the best possible experience on our website. 
                      Some cookies are essential for the site to function, while others help us understand 
                      how you use our platform and improve our services.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                      By clicking "Accept All", you consent to our use of all cookies. You can also 
                      customize your preferences or learn more in our{' '}
                      <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Cookie Policy
                      </Link>.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={handleAcceptAll}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Accept All'}
                  </Button>
                  <Button 
                    onClick={() => setShowSettings(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button 
                    onClick={handleRejectAll}
                    disabled={isLoading}
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Reject All'}
                  </Button>
                </div>
              </div>
            ) : (
              // Settings panel
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                
                <div className="space-y-4">
                  {/* Essential Cookies */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="essential"
                      checked={preferences.essential}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="essential" className="font-medium text-gray-900 dark:text-white">
                        Essential Cookies
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        These cookies are necessary for the website to function and cannot be disabled. 
                        They include authentication, security, and basic functionality.
                      </p>
                    </div>
                  </div>
                  
                  {/* Functional Cookies */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="functional"
                      checked={preferences.functional}
                      onCheckedChange={(checked) => handlePreferenceChange('functional', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="functional" className="font-medium text-gray-900 dark:text-white">
                        Functional Cookies
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        These cookies enable enhanced functionality and personalization, such as 
                        remembering your preferences and settings.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => handlePreferenceChange('analytics', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="font-medium text-gray-900 dark:text-white">
                        Analytics Cookies
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        These cookies help us understand how you use our website so we can improve 
                        our services and user experience.
                      </p>
                    </div>
                  </div>
                  
                  {/* Marketing Cookies */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Checkbox
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => handlePreferenceChange('marketing', checked as boolean)}
                      className="mt-1 border-2 border-gray-400 dark:border-gray-500 data-[state=unchecked]:border-gray-400 dark:data-[state=unchecked]:border-gray-500 data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-gray-800"
                    />
                    <div className="flex-1">
                      <Label htmlFor="marketing" className="font-medium text-gray-900 dark:text-white">
                        Marketing Cookies
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        These cookies are used to deliver relevant advertisements and measure the 
                        effectiveness of our marketing campaigns.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={handleAcceptSelected}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  <Button 
                    onClick={handleAcceptAll}
                    disabled={isLoading}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  >
                    Accept All
                  </Button>
                  <Button 
                    onClick={handleRejectAll}
                    disabled={isLoading}
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                  >
                    Reject All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
