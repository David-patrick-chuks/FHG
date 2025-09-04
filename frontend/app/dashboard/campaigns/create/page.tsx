'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGet, usePost } from '@/hooks/useApi';
import { Bot } from '@/types';
import { ArrowLeft, CheckCircle, Mail, Plus, Upload, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    botId: '',
    emailList: '',
    aiPrompt: ''
  });
  const [uploadedEmails, setUploadedEmails] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch data
  const { data: bots, loading: botsLoading } = useGet<Bot[]>('/bots');
  
  // API operations
  const { execute: createCampaign, loading: creating } = usePost('/campaigns');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['text/csv', 'text/plain'].includes(file.type)) {
      alert('Please upload a CSV or text file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/campaigns/upload-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedEmails(result.data.emails);
        setUploadedFileName(result.data.fileName);
        // Update the email list in the form
        setFormData(prev => ({ ...prev, emailList: result.data.emails.join('\n') }));
        
        if (result.data.invalidEmails.length > 0) {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails and ${result.data.invalidEmails.length} invalid emails.`);
        } else {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails.`);
        }
      } else {
        alert(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadedEmails = () => {
    setUploadedEmails([]);
    setUploadedFileName('');
    setFormData(prev => ({ ...prev, emailList: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        handleFileUpload({ target: { files: [file] } } as any);
      }
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const emailList = formData.emailList.split('\n').filter(email => email.trim());
      const response = await createCampaign({
        name: formData.name,
        description: formData.description,
        botId: formData.botId,
        emailList,
        aiPrompt: formData.aiPrompt
      });
      
      if (response) {
        router.push('/dashboard/campaigns');
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const canProceedToStep2 = formData.name.trim() && formData.botId;
  const canProceedToStep3 = canProceedToStep2 && (uploadedEmails.length > 0 || formData.emailList.trim());
  const canCreateCampaign = canProceedToStep3;

  const steps = [
    { id: 1, title: 'Campaign Basics', description: 'Set up your campaign foundation' },
    { id: 2, title: 'Target Audience', description: 'Define who will receive your emails' },
    { id: 3, title: 'AI Configuration', description: 'Configure your AI email bot' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/campaigns')}
                className="p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Campaign
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Build your email campaign step by step with AI-powered automation
                </p>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {steps[currentStep - 1]?.title}
                </span>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center space-x-4 transition-all duration-300 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > step.id 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25' 
                      : currentStep === step.id 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="font-bold text-lg">{step.id}</span>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <p className={`font-semibold text-base transition-colors ${
                      currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm transition-colors ${
                      currentStep >= step.id ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                    currentStep > step.id 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Campaign Basics */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Campaign Basics
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
                      Set up the foundation of your email campaign
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      Campaign Name 
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Q1 Sales Outreach"
                      className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a descriptive name that reflects your campaign's purpose
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="botId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-green-500" />
                      Select Bot 
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={formData.botId} onValueChange={(value) => setFormData({ ...formData, botId: value })}>
                      <SelectTrigger className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Choose your AI email bot" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2">
                        {bots?.map((bot) => (
                          <SelectItem key={bot._id} value={bot._id} className="rounded-lg">
                            <div className="flex items-center space-x-3 py-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="font-medium">{bot.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select the AI bot that will handle your email campaigns
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    Campaign Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign goals, target audience, and what you want to achieve..."
                    rows={5}
                    className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl resize-none transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Provide context to help the AI understand your campaign objectives
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Continue to Target Audience
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Target Audience */}
          {currentStep === 2 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                      Target Audience
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
                      Define who will receive your emails
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-700 dark:to-green-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Upload Email List</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">Choose your preferred method to add recipients</p>
                      </div>
                      
                      <div 
                        className={`border-2 border-dashed transition-all duration-300 rounded-2xl p-12 text-center ${
                          isDragOver 
                            ? 'border-green-500 bg-green-50/80 dark:bg-green-900/20 scale-105 shadow-lg' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-white dark:bg-gray-800 hover:bg-green-50/50 dark:hover:bg-green-900/10 hover:shadow-md'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="fileUpload"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label htmlFor="fileUpload" className="cursor-pointer block">
                          {isUploading ? (
                            <div className="space-y-6">
                              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                              <div>
                                <p className="text-xl font-semibold text-green-600 dark:text-green-400">Processing your file...</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we extract email addresses</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                isDragOver 
                                  ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/25' 
                                  : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
                              }`}>
                                <Upload className={`w-12 h-12 transition-colors duration-300 ${
                                  isDragOver ? 'text-white' : 'text-green-600 dark:text-green-400'
                                }`} />
                              </div>
                              <div>
                                <p className={`text-2xl font-bold transition-colors duration-300 ${
                                  isDragOver 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {isDragOver ? 'Drop your file here!' : 'Upload Email List'}
                                </p>
                                <p className="text-base text-gray-600 dark:text-gray-400 mt-3">
                                  {isDragOver ? 'Release to upload' : 'Drag and drop your file here, or click to browse'}
                                </p>
                                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>CSV files</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Text files</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Max 5MB</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                    </div>

                    {/* Uploaded File Success */}
                    {uploadedFileName && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 rounded-2xl flex items-center justify-center">
                              <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                {uploadedFileName}
                              </p>
                              <p className="text-base text-green-700 dark:text-green-300 flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>{uploadedEmails.length} valid emails extracted</span>
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearUploadedEmails}
                            className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-800/30 p-3 rounded-xl"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white dark:bg-gray-800 px-6 text-gray-500 dark:text-gray-400 font-semibold text-lg">Or</span>
                      </div>
                    </div>

                    {/* Manual Email Input */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Enter Emails Manually</h4>
                        <p className="text-base text-gray-600 dark:text-gray-400">Type or paste email addresses directly</p>
                      </div>
                      <Textarea
                        id="emailList"
                        value={formData.emailList}
                        onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                        placeholder="Enter email addresses, one per line&#10;example@domain.com&#10;another@domain.com&#10;contact@company.com"
                        rows={6}
                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 resize-none text-base rounded-xl transition-all duration-200"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Type or paste email addresses, one per line
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Basics
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToStep3}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Continue to AI Configuration
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: AI Configuration */}
          {currentStep === 3 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      AI Configuration
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
                      Configure how your AI bot will write emails
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
                  <div className="space-y-6">
                    <Label htmlFor="aiPrompt" className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-purple-500" />
                      AI Prompt 
                      <span className="text-purple-600 font-normal ml-2">(Optional)</span>
                    </Label>
                    <Textarea
                      id="aiPrompt"
                      value={formData.aiPrompt}
                      onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                      placeholder="Describe the type of email you want the AI to generate...&#10;Example: Write a professional email introducing our new product to potential customers"
                      rows={6}
                      className="border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 resize-none text-base rounded-xl transition-all duration-200"
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
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Target Audience
                  </Button>
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={!canCreateCampaign || creating}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mr-3" />
                        Create Campaign
                      </>
                    )}
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
