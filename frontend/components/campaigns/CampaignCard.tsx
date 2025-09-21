'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Bot, Calendar, Mail, Pause, Play, SquarePi, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CampaignCardProps {
  campaign: Campaign;
  botName: string;
  onPause: (campaign: Campaign) => void;
  onResume: (campaign: Campaign) => void;
  onStop: (campaign: Campaign) => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "outline" | "destructive";
  getStatusColor: (status: string) => string;
  viewMode: 'grid' | 'list';
}

export function CampaignCard({
  campaign,
  botName,
  onPause,
  onResume,
  onStop,
  getStatusBadgeVariant,
  getStatusColor,
  viewMode
}: CampaignCardProps) {
  const router = useRouter();

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    const total = campaign.emailList?.length || 0;
    const sent = campaign.sentEmails?.length || 0;
    return total > 0 ? Math.round((sent / total) * 100) : 0;
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {campaign.name}
                </h3>
                <Badge 
                  variant={getStatusBadgeVariant(campaign.status)}
                    className={`${getStatusColor(campaign.status)} text-xs sm:text-sm`}
                >
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2">
                {campaign.description || 'No description provided'}
              </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bot</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{botName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recipients</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.emailList?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.sentEmails?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(campaign.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex gap-2 flex-1">
              {campaign.status === 'running' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPause(campaign)}
                      className="flex-1 sm:flex-none"
                  >
                      <Pause className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Pause</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStop(campaign)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                      <SquarePi className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Stop</span>
                  </Button>
                </>
              )}
              {campaign.status === 'paused' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResume(campaign)}
                      className="flex-1 sm:flex-none"
                  >
                      <Play className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Resume</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStop(campaign)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                      <SquarePi className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Stop</span>
                  </Button>
                </>
              )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view - Mobile-first design
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md h-full">
      <CardContent className="p-4 sm:p-6 h-full flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                {campaign.name}
              </h3>
              <Badge 
                variant={getStatusBadgeVariant(campaign.status)}
                className={`${getStatusColor(campaign.status)} text-xs flex-shrink-0`}
              >
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {campaign.description || 'No description provided'}
          </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Bot</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{botName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Recipients</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.emailList?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.sentEmails?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(campaign.createdAt)}</p>
              </div>
            </div>
            </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            </div>
          </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex gap-2">
            {campaign.status === 'running' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onPause(campaign)}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onStop(campaign)}
                >
                  <SquarePi className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {campaign.status === 'paused' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onResume(campaign)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onStop(campaign)}
                >
                  <SquarePi className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
          </div>
            <Button
            variant="default"
              size="sm"
              onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Details
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
