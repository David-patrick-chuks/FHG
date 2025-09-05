'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlanLimitModal } from '@/components/modals/PlanLimitModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BotsAPI } from '@/lib/api';
import { ArrowLeft, Bot as BotIcon, Check, ExternalLink, Eye, EyeOff, Mail, Plus, Shield, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateBotPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
    prompt: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [userBots, setUserBots] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');

  // Check user's current bots and plan limits
  useEffect(() => {
    const checkUserLimits = async () => {
      try {
        const response = await BotsAPI.getBots({ page: 1, limit: 100 });
        if (response.success && response.data) {
          setUserBots(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch user bots:', error);
      }
    };

    checkUserLimits();
  }, []);

  const getMaxBots = (plan: string) => {
    switch (plan) {
      case 'FREE': return 2;
      case 'PRO': return 10;
      case 'ENTERPRISE': return 50;
      default: return 2;
    }
  };

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
    
    // Check if user has reached bot limit
    const maxBots = getMaxBots(userPlan);
    if (userBots.length >= maxBots) {
      setShowPlanLimitModal(true);
      return;
    }
    
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
        password: formData.password,
        prompt: formData.prompt
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
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
        <Button 
                variant="ghost"
          onClick={() => router.push('/dashboard/bots')}
                className="p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
        >
                <ArrowLeft className="w-5 h-5" />
        </Button>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Bot
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Set up your AI email bot with custom configuration and SMTP settings
                </p>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bot Configuration
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                <BotIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Email Bot
                </span>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BotIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Bot Configuration
                </span>
                <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
                  Configure your AI email bot with custom settings and SMTP credentials
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <BotIcon className="w-4 h-4 mr-2 text-blue-500" />
                    Bot Name 
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sales Assistant Bot"
                    maxLength={50}
                    required
                    className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Bot name should be descriptive and unique</span>
                    <span className={formData.name.length > 45 ? 'text-orange-500' : ''}>
                      {formData.name.length}/50
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-green-500" />
                    Bot Email 
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="bot@company.com"
                    required
                    className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    The email address this bot will use to send emails
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  Bot Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this bot does and its purpose (max 200 characters)"
                  rows={3}
                  maxLength={200}
                  className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl resize-none transition-all duration-200"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Brief description of the bot's purpose and functionality</span>
                  <span className={formData.description.length > 180 ? 'text-orange-500' : ''}>
                    {formData.description.length}/200
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="prompt" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <BotIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  AI Prompt 
                  <span className="text-indigo-600 font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter the AI prompt for this bot...&#10;Example: Write professional, friendly emails that focus on building relationships with potential customers"
                  rows={4}
                  className="border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl resize-none transition-all duration-200"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                        AI Prompt Guidelines
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This prompt defines how your AI bot will write emails. Be specific about tone, style, and goals. 
                        <span className="font-semibold"> This field is optional and can be configured later.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Image Preview */}
              {formData.name.trim() && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <BotIcon className="w-4 h-4 mr-2 text-cyan-500" />
                    Bot Avatar Preview
                  </Label>
                  <div className="bg-gradient-to-br from-gray-50 to-cyan-50/50 dark:from-gray-700 dark:to-cyan-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={`https://robohash.org/${encodeURIComponent(formData.name)}?set=set3&size=200x200`}
                        alt={`${formData.name} avatar`}
                          className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg"
                      />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <BotIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {formData.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          This unique robot avatar is automatically generated based on your bot's name using RoboHash. Each bot gets a distinctive visual identity that reflects its personality and purpose.
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Avatar Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-orange-500" />
                    Email Password 
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <Link 
                    href="/app-password-guide" 
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    How to get app password
                  </Link>
                </Label>
                <div className="flex gap-3">
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
                      className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl pr-12 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleVerifyCredentials}
                    disabled={isVerifying || !formData.email.trim() || !formData.password.trim()}
                    className={`h-14 px-8 font-semibold text-base rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      verificationStatus === 'success' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25' 
                        : verificationStatus === 'error'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Verifying...
                      </>
                    ) : verificationStatus === 'success' ? (
                      <>
                        <Check className="h-5 w-5 mr-3" />
                        Verified
                      </>
                    ) : verificationStatus === 'error' ? (
                      <>
                        <X className="h-5 w-5 mr-3" />
                        Failed
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-3" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Verify your email credentials to ensure the bot can send emails successfully
                </p>
                
                {/* Verification Status */}
                {verificationMessage && (
                  <div className={`text-sm p-4 rounded-xl border-2 transition-all duration-200 ${
                    verificationStatus === 'success' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-200 dark:border-green-700' 
                      : verificationStatus === 'error'
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:text-red-200 dark:border-red-700'
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:text-orange-200 dark:border-orange-700'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {verificationStatus === 'success' ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : verificationStatus === 'error' ? (
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <X className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      )}
                      <span className="font-medium">{verificationMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/bots')}
                  className="flex-1 h-14 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1 h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Creating Bot...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-3 h-6 w-6" />
                      Create Bot
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Plan Limit Modal */}
      <PlanLimitModal
        isOpen={showPlanLimitModal}
        onClose={() => setShowPlanLimitModal(false)}
        currentPlan={userPlan}
        currentBots={userBots.length}
        maxBots={getMaxBots(userPlan)}
      />
    </DashboardLayout>
  );
}
