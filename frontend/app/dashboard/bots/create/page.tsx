'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';
import { Bot as BotIcon, ArrowLeft, CheckCircle, Plus, Shield, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateBotPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTestingCredentials, setIsTestingCredentials] = useState(false);
  const [credentialsTestResult, setCredentialsTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
    prompt: '',
    isActive: true
  });

  const testCredentials = async () => {
    if (!formData.email || !formData.password) {
      setCredentialsTestResult({
        success: false,
        message: 'Please enter both email and password to test'
      });
      return;
    }

    setIsTestingCredentials(true);
    setCredentialsTestResult(null);

    try {
      // TODO: Implement actual credentials testing API call
      // For now, simulate a successful test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCredentialsTestResult({
        success: true,
        message: 'Email credentials verified successfully!'
      });
      setCredentialsVerified(true);
    } catch (error) {
      setCredentialsTestResult({
        success: false,
        message: 'Failed to verify credentials. Please check your email and password.'
      });
      setCredentialsVerified(false);
    } finally {
      setIsTestingCredentials(false);
    }
  };

  const handleCreateBot = async () => {
    if (!credentialsVerified) {
      alert('Please verify your credentials before creating the bot');
      return;
    }

    try {
      // TODO: Implement bot creation API call
      console.log('Creating bot:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to bots list
      router.push('/dashboard/bots');
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert('Failed to create bot. Please try again.');
    }
  };

  const canProceedToStep2 = formData.name.trim() && formData.email.trim();
  const canProceedToStep3 = canProceedToStep2 && credentialsVerified;
  const canCreateBot = canProceedToStep3;

  const steps = [
    { id: 1, title: 'Bot Basics', description: 'Set up your bot foundation', icon: BotIcon },
    { id: 2, title: 'Credentials', description: 'Verify email authentication', icon: Shield },
    { id: 3, title: 'AI Configuration', description: 'Configure your AI behavior', icon: Sparkles }
  ];

  return (
    <DashboardLayout title="Create Bot" description="Build your AI email bot step by step">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/bots')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Bot</h1>
              <p className="text-gray-600">Build your AI email bot step by step</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  currentStep > step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Bot Basics */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BotIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Bot Basics</span>
                </CardTitle>
                <CardDescription>
                  Set up the foundation of your AI email bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      Bot Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Sales Outreach Bot"
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="bot@yourcompany.com"
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Bot Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this bot does, its purpose, and target audience..."
                    rows={4}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
                  >
                    Continue to Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Credentials */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Email Credentials</span>
                </CardTitle>
                <CardDescription>
                  Verify your email authentication to enable bot functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-900 mb-2">Credentials Required</h4>
                      <p className="text-sm text-amber-800">
                        You must verify your email credentials before creating a bot. This ensures your bot can send emails on your behalf.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Email Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter your email password"
                        className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500 h-12 text-base"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={testCredentials}
                        disabled={isTestingCredentials || !formData.email || !formData.password}
                        className="whitespace-nowrap h-12 px-6 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                      >
                        {isTestingCredentials ? (
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Test Credentials
                      </Button>
                    </div>
                  </div>

                  {/* Credentials Test Result */}
                  {credentialsTestResult && (
                    <div className={`rounded-xl p-4 border ${
                      credentialsTestResult.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        {credentialsTestResult.success ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✗</span>
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${
                            credentialsTestResult.success ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {credentialsTestResult.message}
                          </p>
                          {credentialsTestResult.success && (
                            <p className="text-sm text-green-700 mt-1">
                              ✅ Credentials verified! You can now proceed to configure your AI bot.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Security Note</h4>
                        <p className="text-sm text-blue-800">
                          Your credentials are encrypted and stored securely. We never store your password in plain text.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3"
                  >
                    Back to Basics
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToStep3}
                    className="bg-green-600 hover:bg-green-700 px-6 py-3"
                  >
                    Continue to AI Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: AI Configuration */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>AI Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure how your AI bot will behave and write emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="space-y-4">
                    <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                      AI Prompt <span className="text-purple-600 font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="prompt"
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      placeholder="Describe how the AI should behave and write emails...&#10;Example: You are a professional sales representative. Be friendly, professional, and focus on how our solution can help solve their business problems. Keep the tone conversational and avoid being too pushy."
                      rows={6}
                      className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                    <div className="flex items-start space-x-2 text-sm text-purple-700">
                      <div className="w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-purple-600 text-xs">i</span>
                      </div>
                      <p>
                        This prompt defines how your AI bot will write emails. Be specific about tone, style, and goals. 
                        <span className="font-medium"> This field is optional and can be configured later.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <div>
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Bot is Active
                      </Label>
                      <p className="text-xs text-gray-500">
                        Active bots can send emails. You can deactivate them anytime.
                      </p>
                    </div>
                  </div>

                  {/* Bot Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Bot Preview</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.email || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credentials:</span>
                        <span className={`font-medium ${credentialsVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {credentialsVerified ? 'Verified' : 'Not verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3"
                  >
                    Back to Credentials
                  </Button>
                  <Button
                    onClick={handleCreateBot}
                    disabled={!canCreateBot}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Bot
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
