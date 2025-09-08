import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Upload, X, Users, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface EmailListManagerProps {
  emailList: string;
  onEmailListChange: (emails: string) => void;
  uploadedEmails: string[];
  uploadedFileName: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearUploaded: () => void;
  isUploading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  selectedBotEmailsRemaining: number;
  disabled?: boolean;
}

export function EmailListManager({
  emailList,
  onEmailListChange,
  uploadedEmails,
  uploadedFileName,
  onFileUpload,
  onClearUploaded,
  isUploading,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  selectedBotEmailsRemaining,
  disabled
}: EmailListManagerProps) {
  const [showEmailCount, setShowEmailCount] = useState(false);
  
  // Parse emails from text field
  const emailsFromText = emailList.split('\n').filter(email => email.trim());
  const totalEmails = uploadedEmails.length > 0 ? uploadedEmails.length : emailsFromText.length;
  
  // Check if email count exceeds bot's remaining capacity
  const exceedsLimit = totalEmails > selectedBotEmailsRemaining;
  const isNearLimit = totalEmails > selectedBotEmailsRemaining * 0.8;

  return (
    <div className="space-y-6">
      {/* Email Count Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Email List Summary
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {totalEmails} email{totalEmails !== 1 ? 's' : ''} ready to send
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Bot can send: <span className="font-semibold">{selectedBotEmailsRemaining}</span>
            </div>
            {exceedsLimit && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm mt-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Exceeds daily limit</span>
              </div>
            )}
            {isNearLimit && !exceedsLimit && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 text-sm mt-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Near daily limit</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Upload Email List</h4>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Choose your preferred method to add recipients</p>
        </div>
        
        <div 
          className={`border-2 border-dashed transition-all duration-300 rounded-2xl p-12 text-center ${
            disabled
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50'
              : isDragOver 
              ? 'border-green-500 bg-green-50/80 dark:bg-green-900/20 scale-105 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-white dark:bg-gray-800 hover:bg-green-50/50 dark:hover:bg-green-900/10 hover:shadow-md'
          }`}
          onDragOver={disabled ? undefined : onDragOver}
          onDragLeave={disabled ? undefined : onDragLeave}
          onDrop={disabled ? undefined : onDrop}
        >
          <input
            type="file"
            id="fileUpload"
            accept=".csv,.txt"
            onChange={onFileUpload}
            className="hidden"
            disabled={isUploading || disabled}
          />
          <label htmlFor="fileUpload" className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
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
        <Card className="border-2 border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="p-6">
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
                onClick={onClearUploaded}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-800/30 p-3 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="emailList" className="text-xl font-bold text-gray-900 dark:text-white">
            Enter Emails Manually
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowEmailCount(!showEmailCount)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showEmailCount ? 'Hide' : 'Show'} Count
          </Button>
        </div>
        
        <p className="text-base text-gray-600 dark:text-gray-400">Type or paste email addresses directly</p>
        
        <Textarea
          id="emailList"
          value={emailList}
          onChange={(e) => onEmailListChange(e.target.value)}
          placeholder="Enter email addresses, one per line&#10;example@domain.com&#10;another@domain.com&#10;contact@company.com"
          rows={6}
          disabled={disabled}
          className={`border-2 resize-none text-base rounded-xl transition-all duration-200 ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : exceedsLimit 
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : isNearLimit
              ? 'border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20'
              : 'border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-4 focus:ring-green-500/20'
          }`}
        />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Type or paste email addresses, one per line
          </p>
          {showEmailCount && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{emailsFromText.length}</span> emails in text field
            </div>
          )}
        </div>
        
        {/* Warning Messages */}
        {exceedsLimit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Email Limit Exceeded
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You have {totalEmails} emails but your bot can only send {selectedBotEmailsRemaining} today. 
                  Please reduce your email list or wait until tomorrow.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isNearLimit && !exceedsLimit && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                  Approaching Daily Limit
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You're using {Math.round((totalEmails / selectedBotEmailsRemaining) * 100)}% of your daily email limit.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
