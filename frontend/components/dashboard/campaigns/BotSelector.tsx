import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-2">
      <Label htmlFor="botId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
        <BotIcon className="w-4 h-4 mr-2 text-green-500" />
        Select Bot 
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <Select value={selectedBotId} onValueChange={onBotSelect} disabled={isLoading || disabled}>
        <SelectTrigger className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-200">
          {selectedBot ? (
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <img
                  src={getBotAvatarUrl(selectedBot.name)}
                  alt={`${selectedBot.name} avatar`}
                  className="w-6 h-6 rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <BotIcon className="w-1 h-1 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedBot.name}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    selectedBot.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedBot.email}
                </div>
              </div>
            </div>
          ) : (
            <SelectValue placeholder="Choose your AI email bot" />
          )}
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2 max-h-96">
          {bots?.map((bot) => {
            const remainingEmails = getRemainingEmails(bot);
            const isNearLimit = remainingEmails < 100;
            const isAtLimit = remainingEmails === 0;
            
            return (
              <SelectItem key={bot._id} value={bot._id} className="rounded-lg p-0">
                <div className="flex items-center space-x-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {/* Bot Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getBotAvatarUrl(bot.name)}
                      alt={`${bot.name} avatar`}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <BotIcon className="w-1.5 h-1.5 text-white" />
                    </div>
                  </div>
                  
                  {/* Bot Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {bot.name}
                      </h4>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        bot.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{bot.email}</span>
                    </div>
                    
                    {/* Email Limits */}
                    <div className="flex items-center space-x-2 mt-1">
                      <Zap className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {remainingEmails} remaining
                      </span>
                      {isAtLimit && (
                        <Badge variant="destructive" className="text-xs px-1 py-0.5 h-4">
                          Limit
                        </Badge>
                      )}
                      {isNearLimit && !isAtLimit && (
                        <Badge variant="outline" className="text-xs px-1 py-0.5 border-orange-300 text-orange-600 h-4">
                          Low
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
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Gmail SMTP has a daily limit of 500 emails.
      </p>
    </div>
  );
}
