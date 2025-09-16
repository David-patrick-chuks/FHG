'use client';

import { BotProgressSteps } from '@/components/dashboard/bots/BotProgressSteps';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BotsAPI } from '@/lib/api';
import { ArrowLeft, Bot as BotIcon, Check, ExternalLink, Eye, EyeOff, Mail, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateBotPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Set up your bot foundation' },
    { id: 2, title: 'Email Setup', description: 'Configure email credentials' }
  ];

  // Validation functions
  const canProceedToStep2 = formData.name.trim() && formData.name.length <= 50 && formData.email.trim() && formData.description.length <= 200;
  const canCreateBot = canProceedToStep2 && verificationStatus === 'success';


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
      console.log('Making API call to test credentials...'); // Debug log
      const response = await BotsAPI.testCredentials({
          email: formData.email,
          password: formData.password
      });

      console.log('API Response received:', response); // Debug log

      if (response.success) {
        setVerificationStatus('success');
        setVerificationMessage('Credentials verified successfully!');
      } else {
        setVerificationStatus('error');
        
        // Handle the specific API response structure
        const apiMessage = response.message || 'Email verification failed';
        const dataMessage = response.data?.message || 'Invalid email or password';
        
        console.log('API Message:', apiMessage, 'Data Message:', dataMessage); // Debug log
        
        // Use the specific error message from the API response
        setVerificationMessage(apiMessage);
      }
    } catch (error) {
      console.error('Verification error caught:', error);
      setVerificationStatus('error');
      
      // Check if it's an API error with a specific message
      if (error instanceof Error && error.message) {
        console.log('Error message from catch:', error.message); // Debug log
        setVerificationMessage(error.message);
      } else {
      setVerificationMessage('Network error. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation errors (don't affect verification status)
    if (!formData.name.trim() || formData.name.length > 50 || formData.description.length > 200) {
      setVerificationMessage('Please check your bot name and description. Name must be 1-50 characters, description must be under 200 characters.');
      return;
    }


    // Check if credentials are verified (don't reset verification status)
    if (verificationStatus !== 'success') {
      setVerificationMessage('Please verify your email credentials before creating the bot.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await BotsAPI.createBot({
          name: formData.name,
          description: formData.description,
          email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Redirect back to bots page
        router.push('/dashboard/bots');
      } else {
        console.error('Failed to create bot:', response.error);
        // Don't reset verification status, just show the error message
        setVerificationMessage(response.error || 'Failed to create bot');
      }
    } catch (error) {
      console.error('Failed to create bot:', error);
      // Don't reset verification status, just show the error message
      if (error instanceof Error) {
        setVerificationMessage(error.message);
      } else {
        setVerificationMessage('Network error. Please try again.');
      }
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
      title="Create New Bot"
      description="Set up your AI email bot with custom configuration and SMTP settings"
      actions={
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/bots')}
          className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Bots</span>
          <span className="sm:hidden">Back</span>
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Progress Steps */}
        <div className="px-2 sm:px-0">
          <BotProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BotIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-lg sm:text-xl">Basic Information</span>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal mt-0.5 sm:mt-1">
                    Set up your bot's basic details and identity
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bot Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sales Assistant Bot"
                    maxLength={50}
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Descriptive and unique name</span>
                    <span className={formData.name.length > 45 ? 'text-orange-500' : ''}>
                      {formData.name.length}/50
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bot Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="bot@company.com"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email address for sending emails
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Bot Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this bot does and its purpose (max 200 characters)"
                  rows={3}
                  maxLength={200}
                  className="resize-none border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm sm:text-base"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Brief description of the bot's purpose</span>
                  <span className={formData.description.length > 180 ? 'text-orange-500' : ''}>
                    {formData.description.length}/200
                  </span>
                </div>
              </div>

              {/* Bot Avatar Preview */}
              {formData.name.trim() && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bot Avatar Preview
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <img
                        src={`https://robohash.org/${encodeURIComponent(formData.name)}?set=set3&size=200x200`}
                        alt={`${formData.name} avatar`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-white dark:border-gray-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {formData.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Unique avatar generated from your bot name
                        </p>
                        <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex justify-end p-4 sm:p-6 pt-0">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                className="h-10 sm:h-12 px-6 sm:px-8 bg-cyan-600 hover:bg-cyan-700 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Continue to Email Setup</span>
                <span className="sm:hidden">Continue</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          </Card>
          )}

          {/* Step 2: Email Setup */}
          {currentStep === 2 && (
            <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-lg sm:text-xl">Email Setup</span>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal mt-0.5 sm:mt-1">
                    Configure SMTP credentials for sending emails
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>
                    Email Password <span className="text-red-500">*</span>
                  </span>
                  <Link 
                    href="/app-password-guide" 
                    target="_blank"
                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                    How to get app password
                  </Link>
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        // Remove spaces from password input
                        const cleanPassword = e.target.value.replace(/\s/g, '');
                        setFormData(prev => ({ ...prev, password: cleanPassword }));
                        // Reset verification status when password changes
                        if (verificationStatus !== 'idle') {
                          setVerificationStatus('idle');
                          setVerificationMessage('');
                        }
                      }}
                      onPaste={(e) => {
                        // Handle paste event to remove spaces
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const cleanPassword = pastedText.replace(/\s/g, '');
                        setFormData(prev => ({ ...prev, password: cleanPassword }));
                        // Reset verification status when password changes
                        if (verificationStatus !== 'idle') {
                          setVerificationStatus('idle');
                          setVerificationMessage('');
                        }
                      }}
                      placeholder="Enter your email password"
                      required
                      className="h-10 sm:h-12 pr-10 sm:pr-12 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleVerifyCredentials}
                    disabled={isVerifying || !formData.email.trim() || !formData.password.trim()}
                    className={`h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base ${
                      verificationStatus === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : verificationStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                        <span className="hidden sm:inline">Verifying...</span>
                        <span className="sm:hidden">Verify...</span>
                      </>
                    ) : verificationStatus === 'success' ? (
                      <>
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Verified</span>
                        <span className="sm:hidden">✓</span>
                      </>
                    ) : verificationStatus === 'error' ? (
                      <>
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Failed</span>
                        <span className="sm:hidden">✗</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Verify</span>
                        <span className="sm:hidden">Verify</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Verify your email credentials to ensure the bot can send emails successfully
                </p>
                
                {/* Verification Status */}
                {verificationMessage && (
                  <div className={`text-sm p-3 rounded-lg border ${
                    verificationStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700' 
                      : verificationStatus === 'error'
                      ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700'
                      : 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-700'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {verificationStatus === 'success' ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : verificationStatus === 'error' ? (
                        <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-xs sm:text-sm">{verificationMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 sm:p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Basic Info</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!canCreateBot || isLoading}
                className="h-10 sm:h-12 px-6 sm:px-8 bg-cyan-600 hover:bg-cyan-700 text-sm sm:text-base order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Creating Bot...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create Bot</span>
                    <span className="sm:hidden">Create</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
