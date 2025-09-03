'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGet, usePost } from '@/hooks/useApi';
import { Bot, Campaign } from '@/types';
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
    <DashboardLayout title="Create Campaign" description="Build your email campaign step by step">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/campaigns')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="text-gray-600">Build your email campaign step by step</p>
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep > step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
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
          {/* Step 1: Campaign Basics */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <span>Campaign Basics</span>
                </CardTitle>
                <CardDescription>
                  Set up the foundation of your email campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      Campaign Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Q1 Sales Outreach"
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="botId" className="text-sm font-medium text-gray-700 flex items-center">
                      Select Bot <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={formData.botId} onValueChange={(value) => setFormData({ ...formData, botId: value })}>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 text-base">
                        <SelectValue placeholder="Choose your AI email bot" />
                      </SelectTrigger>
                      <SelectContent>
                        {bots?.map((bot) => (
                          <SelectItem key={bot._id} value={bot._id}>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>{bot.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Campaign Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign goals, target audience, and what you want to achieve..."
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
                    Continue to Target Audience
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Target Audience */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                  <span>Target Audience</span>
                </CardTitle>
                <CardDescription>
                  Define who will receive your emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Email List</h4>
                        <p className="text-gray-600">Choose your preferred method to add recipients</p>
                      </div>
                      
                      <div 
                        className={`border-2 border-dashed transition-all duration-200 rounded-xl p-8 text-center ${
                          isDragOver 
                            ? 'border-green-500 bg-green-50/80 scale-105' 
                            : 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50/50'
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
                            <div className="space-y-4">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                              <p className="text-base font-medium text-green-600">Processing your file...</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <Upload className="w-10 h-10 text-green-600" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900">
                                  {isDragOver ? 'Drop your file here!' : 'Upload Email List'}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                  {isDragOver ? 'Release to upload' : 'Drag and drop your file here, or click to browse'}
                                </p>
                                <p className="text-xs text-gray-500 mt-3">
                                  Supports CSV and text files up to 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* File Type Info */}
                      <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>CSV files</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Text files</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Max 5MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded File Success */}
                    {uploadedFileName && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-green-900">
                                {uploadedFileName}
                              </p>
                              <p className="text-sm text-green-700">
                                ✅ {uploadedEmails.length} valid emails extracted
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearUploadedEmails}
                            className="text-green-600 hover:text-green-800 hover:bg-green-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-gray-50 px-4 text-gray-500 font-medium">Or</span>
                      </div>
                    </div>

                    {/* Manual Email Input */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <h4 className="text-base font-medium text-gray-900">Enter Emails Manually</h4>
                        <p className="text-sm text-gray-600">Type or paste email addresses directly</p>
                      </div>
                      <Textarea
                        id="emailList"
                        value={formData.emailList}
                        onChange={(e) => setFormData({ ...formData, emailList: e.target.value })}
                        placeholder="Enter email addresses, one per line&#10;example@domain.com&#10;another@domain.com&#10;contact@company.com"
                        rows={6}
                        className="focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Type or paste email addresses, one per line
                      </p>
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
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <span>AI Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure how your AI bot will write emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="space-y-4">
                    <Label htmlFor="aiPrompt" className="text-sm font-medium text-gray-700">
                      AI Prompt <span className="text-purple-600 font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="aiPrompt"
                      value={formData.aiPrompt}
                      onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                      placeholder="Describe the type of email you want the AI to generate...&#10;Example: Write a professional email introducing our new product to potential customers"
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

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3"
                  >
                    Back to Target Audience
                  </Button>
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={!canCreateCampaign || creating}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
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
