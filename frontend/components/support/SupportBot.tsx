'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hi! I'm MailQuill's support bot. How can I help you today?",
    isUser: false,
    timestamp: new Date(),
  }
];

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Get Started', action: 'get_started' },
  { id: '2', text: 'Pricing Info', action: 'pricing' },
  { id: '3', text: 'Features', action: 'features' },
  { id: '4', text: 'Contact Support', action: 'contact' },
];

const suggestions = [
  "How do I create my first email campaign?",
  "What are your pricing plans?",
  "How does AI email generation work?",
  "Can I integrate with my existing tools?",
  "What's the difference between free and paid plans?",
];

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pricing') || input.includes('price') || input.includes('cost')) {
      return "Our pricing starts with a free plan that includes basic features. We also have Pro ($29/month) and Enterprise ($99/month) plans with advanced AI features, automation, and analytics. Would you like me to show you our pricing page?";
    }
    
    if (input.includes('feature') || input.includes('what can') || input.includes('capabilities')) {
      return "MailQuill offers AI-powered email generation, automation workflows, advanced analytics, A/B testing, template library, and integrations with popular tools. You can create, schedule, and optimize email campaigns with ease!";
    }
    
    if (input.includes('start') || input.includes('begin') || input.includes('getting started')) {
      return "Great! To get started, simply sign up for a free account. You'll get access to our basic features and can create your first email campaign in minutes. No credit card required!";
    }
    
    if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return "I'm here to help! For more detailed support, you can contact our team at support@mailquill.com or visit our help center. We typically respond within 24 hours.";
    }
    
    if (input.includes('ai') || input.includes('artificial intelligence')) {
      return "Our AI technology helps you create engaging email content, optimize send times, and personalize messages for better engagement. It learns from your audience's behavior to improve results over time.";
    }
    
    if (input.includes('integration') || input.includes('connect') || input.includes('api')) {
      return "Yes! MailQuill integrates with popular tools like CRM systems, e-commerce platforms, and analytics tools. We also offer a comprehensive API for custom integrations.";
    }
    
    // Default response
    return "That's a great question! I'd be happy to help you with that. Could you provide a bit more detail, or would you like me to connect you with our support team?";
  };

  const handleQuickReply = (action: string) => {
    let message = '';
    switch (action) {
      case 'get_started':
        message = 'How do I get started with MailQuill?';
        break;
      case 'pricing':
        message = 'What are your pricing plans?';
        break;
      case 'features':
        message = 'What features does MailQuill offer?';
        break;
      case 'contact':
        message = 'I need to contact support';
        break;
      default:
        message = action;
    }
    handleSendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={toggleBot}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            !
          </span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-6 right-6 z-50 w-80 shadow-2xl border-0 bg-white dark:bg-gray-800 transition-all duration-300",
          isMinimized ? "h-16" : "h-96"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">MailQuill Support</h3>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBot}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.isUser
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        )}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              {messages.length === 1 && (
                <div className="p-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply.action)}
                        className="text-xs h-7"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {messages.length > 1 && messages.length < 4 && (
                <div className="p-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Popular questions:</p>
                  <div className="space-y-1">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 py-1"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage(inputValue);
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    size="sm"
                    disabled={!inputValue.trim() || isTyping}
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
