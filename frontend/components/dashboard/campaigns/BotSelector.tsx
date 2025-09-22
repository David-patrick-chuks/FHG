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
    <div className="space-y-3">
      <Label htmlFor="botId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
        <BotIcon className="w-4 h-4 mr-2 text-cyan-500" />
        Select Bot 
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <Select value={selectedBotId} onValueChange={onBotSelect} disabled={isLoading || disabled}>
        <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 hover:border-cyan-300 dark:hover:border-cyan-500">
          {selectedBot ? (
            <div className="flex items-center space-x-3 w-full">
              <div className="relative flex-shrink-0">
                <img
                  src={getBotAvatarUrl(selectedBot.name)}
                  alt={`${selectedBot.name} avatar`}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <BotIcon className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                    {selectedBot.name}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    selectedBot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{selectedBot.email}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Zap className="w-3 h-3 text-cyan-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getRemainingEmails(selectedBot)} emails remaining today
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <SelectValue placeholder="Choose your AI email bot" />
          )}
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2 max-h-96 bg-white dark:bg-gray-800 shadow-xl">
          {bots?.map((bot) => {
            const remainingEmails = getRemainingEmails(bot);
            const isNearLimit = remainingEmails < 100;
            const isAtLimit = remainingEmails === 0;
            
            return (
              <SelectItem key={bot._id} value={bot._id} className="rounded-lg p-0 focus:bg-cyan-50 dark:focus:bg-cyan-900/20">
                <div className="flex items-center space-x-3 p-4 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  {/* Bot Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getBotAvatarUrl(bot.name)}
                      alt={`${bot.name} avatar`}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <BotIcon className="w-1.5 h-1.5 text-white" />
                    </div>
                  </div>
                  
                  {/* Bot Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                        {bot.name}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${
                        bot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{bot.email}</span>
                    </div>
                    
                    {/* Email Limits */}
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-cyan-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {remainingEmails} emails remaining today
                      </span>
                      {isAtLimit && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5 h-5">
                          At Limit
                        </Badge>
                      )}
                      {isNearLimit && !isAtLimit && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-300 text-orange-600 h-5">
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
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Gmail SMTP Limit:</span> Each bot can send up to 500 emails per day. 
            Choose a bot with sufficient remaining capacity for your campaign.
          </p>
        </div>
      </div>
    </div>
  );
}
