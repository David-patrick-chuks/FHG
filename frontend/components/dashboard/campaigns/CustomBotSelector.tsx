'use client';

import { Label } from '@/components/ui/label';
import { Bot } from '@/types';
import { AlertTriangle, Bot as BotIcon, Check, ChevronDown, Clock, Mail, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CustomBotSelectorProps {
  bots: Bot[];
  selectedBotId: string;
  onBotSelect: (botId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CustomBotSelector({ bots, selectedBotId, onBotSelect, isLoading, disabled }: CustomBotSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  const getBotStatusInfo = (bot: Bot) => {
    const remaining = getRemainingEmails(bot);
    const percentage = (remaining / DAILY_EMAIL_LIMIT) * 100;
    
    if (remaining === 0) {
      return { status: 'exhausted', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-700' };
    } else if (percentage < 20) {
      return { status: 'critical', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-700' };
    } else if (percentage < 50) {
      return { status: 'low', color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-700' };
    } else {
      return { status: 'good', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-700' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exhausted':
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      case 'low':
        return <Clock className="w-3 h-3" />;
      default:
        return <Check className="w-3 h-3" />;
    }
  };

  // Filter bots based on search term
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBotSelect = (botId: string) => {
    onBotSelect(botId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="botId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
        <BotIcon className="w-4 h-4 mr-2 text-cyan-500" />
        Select Bot 
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Custom Select Trigger */}
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading || disabled}
          className={`w-full min-h-[4rem] sm:min-h-[5rem] text-left border-2 rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 ${
            isOpen 
              ? 'border-cyan-500 ring-4 ring-cyan-500/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-cyan-300 dark:hover:border-cyan-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selectedBot ? (
            <div className="flex items-center justify-between p-3 sm:p-4 h-full">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                {/* Bot Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={getBotAvatarUrl(selectedBot.name)}
                    alt={`${selectedBot.name} avatar`}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <BotIcon className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                  </div>
                </div>
                
                {/* Bot Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base md:text-lg">
                      {selectedBot.name}
                    </h3>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      selectedBot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{selectedBot.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Zap className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {getRemainingEmails(selectedBot)} emails remaining
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge - Hidden on very small screens */}
              <div className="hidden sm:flex flex-shrink-0 ml-2 sm:ml-4">
                {(() => {
                  const statusInfo = getBotStatusInfo(selectedBot);
                  return (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                      {getStatusIcon(statusInfo.status)}
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status === 'exhausted' ? 'Exhausted' : 
                         statusInfo.status === 'critical' ? 'Critical' :
                         statusInfo.status === 'low' ? 'Low' : 'Good'}
                      </span>
                    </div>
                  );
                })()}
              </div>
              
              {/* Dropdown Arrow */}
              <div className="flex-shrink-0 ml-2">
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 sm:p-4 h-full">
              <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Choose your AI email bot</span>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </button>

        {/* Custom Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl z-50 max-h-80 sm:max-h-96 overflow-hidden">
            {/* Search Bar */}
            <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Bot List */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              {filteredBots.length > 0 ? (
                filteredBots.map((bot) => {
                  const statusInfo = getBotStatusInfo(bot);
                  const isSelected = bot._id === selectedBotId;
                  
                  return (
                    <button
                      key={bot._id}
                      type="button"
                      onClick={() => handleBotSelect(bot._id)}
                      className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Bot Avatar */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={getBotAvatarUrl(bot.name)}
                            alt={`${bot.name} avatar`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                            <BotIcon className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                          </div>
                        </div>
                        
                        {/* Bot Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                              {bot.name}
                            </h4>
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              bot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          
                          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{bot.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Zap className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {getRemainingEmails(bot)} emails remaining
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge - Hidden on very small screens */}
                        <div className="hidden sm:flex flex-shrink-0">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                            {getStatusIcon(statusInfo.status)}
                            <span className={`text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.status === 'exhausted' ? 'Exhausted' : 
                               statusInfo.status === 'critical' ? 'Critical' :
                               statusInfo.status === 'low' ? 'Low' : 'Good'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No bots found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Help Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-2">
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-semibold">Gmail SMTP Limit:</span> Each bot can send up to 500 emails per day. 
            Choose a bot with sufficient remaining capacity for your campaign.
          </p>
        </div>
      </div>
    </div>
  );
}
