'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bot } from '@/types';
import { Bot as BotIcon, Edit, MoreVertical, Power, PowerOff, Trash2 } from 'lucide-react';

interface BotCardProps {
  bot: Bot;
  hasActiveCampaign: boolean;
  viewMode: 'grid' | 'list';
  onToggleStatus: (bot: Bot) => void;
  onEdit: (bot: Bot) => void;
  onDelete: (bot: Bot) => void;
}

export function BotCard({ 
  bot, 
  hasActiveCampaign, 
  viewMode, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}: BotCardProps) {
  const getBotAvatar = (bot: Bot) => {
    const initials = bot.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials;
  };

  const getBotStatusBadge = (bot: Bot) => {
    if (bot.isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
          <Power className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <PowerOff className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    }
  };

  const getCampaignBadge = (hasActiveCampaign: boolean) => {
    if (hasActiveCampaign) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          <BotIcon className="w-3 h-3 mr-1" />
          Running Campaign
        </Badge>
      );
    }
    return null;
  };

  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${bot.isActive ? 'border-l-green-500' : 'border-l-gray-300'} ${!bot.isActive ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                <AvatarImage src={`https://robohash.org/${bot._id}?set=set1&size=48x48`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getBotAvatar(bot)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bot.name}
                  </h3>
                  {getBotStatusBadge(bot)}
                  {getCampaignBadge(hasActiveCampaign)}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {bot.description || 'No description provided'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Daily Limit</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{bot.dailyEmailLimit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Sent Today</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{bot.emailsSentToday}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">From Email</span>
                    <span className="font-semibold text-gray-900 dark:text-white truncate text-xs">
                      {bot.smtpConfig?.fromEmail || bot.email}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Created</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(bot.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onToggleStatus(bot)}
                  disabled={bot.isActive && hasActiveCampaign}
                  className="cursor-pointer"
                >
                  {bot.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(bot)}
                  disabled={hasActiveCampaign}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Bot
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(bot)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Bot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${bot.isActive ? 'border-l-green-500 hover:border-l-green-600' : 'border-l-gray-300'} ${!bot.isActive ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all">
              <AvatarImage src={`https://robohash.org/${bot._id}?set=set1&size=48x48`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getBotAvatar(bot)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{bot.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getBotStatusBadge(bot)}
                {getCampaignBadge(hasActiveCampaign)}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onToggleStatus(bot)}
                disabled={bot.isActive && hasActiveCampaign}
                className="cursor-pointer"
              >
                {bot.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(bot)}
                disabled={hasActiveCampaign}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Bot
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(bot)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Bot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2 mt-3">
          {bot.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Daily Limit</span>
            <span className="font-semibold text-gray-900 dark:text-white">{bot.dailyEmailLimit}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Sent Today</span>
            <span className="font-semibold text-gray-900 dark:text-white">{bot.emailsSentToday}</span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">From Email</span>
            <span className="font-semibold text-gray-900 dark:text-white truncate text-xs">
              {bot.smtpConfig?.fromEmail || bot.email}
            </span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Created</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {new Date(bot.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
