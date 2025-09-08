import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot } from '@/types';
import { Bot as BotIcon, Mail, Zap } from 'lucide-react';

interface BotSelectorProps {
  bots: Bot[];
  selectedBotId: string;
  onBotSelect: (botId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function BotSelector({ bots, selectedBotId, onBotSelect, isLoading, disabled }: BotSelectorProps) {
  const selectedBot = bots.find(bot => bot._id === selectedBotId);
  
  // Gmail SMTP daily limit
  const DAILY_EMAIL_LIMIT = 500;
  
  const getRemainingEmails = (bot: Bot) => {
    const emailsSentToday = bot.emailsSentToday || 0;
    return Math.max(0, DAILY_EMAIL_LIMIT - emailsSentToday);
  };

  const getBotAvatarUrl = (botName: string) => {
    return `https://robohash.org/${encodeURIComponent(botName)}?set=set3&size=200x200`;
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="botId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
        <BotIcon className="w-4 h-4 mr-2 text-green-500" />
        Select Bot 
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <Select value={selectedBotId} onValueChange={onBotSelect} disabled={isLoading || disabled}>
        <SelectTrigger className="h-14 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200">
          <SelectValue placeholder="Choose your AI email bot" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2 max-h-96">
          {bots?.map((bot) => {
            const remainingEmails = getRemainingEmails(bot);
            const isNearLimit = remainingEmails < 100;
            const isAtLimit = remainingEmails === 0;
            
            return (
              <SelectItem key={bot._id} value={bot._id} className="rounded-lg p-0">
                <div className="flex items-center space-x-4 p-4 w-full">
                  {/* Bot Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getBotAvatarUrl(bot.name)}
                      alt={`${bot.name} avatar`}
                      className="w-12 h-12 rounded-xl border-2 border-white dark:border-gray-700 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <BotIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  {/* Bot Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {bot.name}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${
                        bot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{bot.email}</span>
                    </div>
                    
                    {/* Email Limits */}
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {remainingEmails} emails remaining today
                      </span>
                      {isAtLimit && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          Limit Reached
                        </Badge>
                      )}
                      {isNearLimit && !isAtLimit && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-300 text-orange-600">
                          Near Limit
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Selected Bot Details */}
      {selectedBot && (
        <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-shrink-0">
                <img
                  src={getBotAvatarUrl(selectedBot.name)}
                  alt={`${selectedBot.name} avatar`}
                  className="w-16 h-16 rounded-xl border-2 border-white dark:border-gray-700 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <BotIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBot.name}
                  </h4>
                  <div className={`w-2 h-2 rounded-full ${
                    selectedBot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{selectedBot.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {getRemainingEmails(selectedBot)} of {DAILY_EMAIL_LIMIT} emails remaining today
                    </span>
                    {getRemainingEmails(selectedBot) < 100 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-300 text-orange-600">
                        Gmail Limit
                      </Badge>
                    )}
                  </div>
                  
                  {selectedBot.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {selectedBot.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Select the AI bot that will handle your email campaigns. Gmail SMTP has a daily limit of 500 emails.
      </p>
    </div>
  );
}
