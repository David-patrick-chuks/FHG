'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    RotateCcw,
    Send,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'human_help';
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! How can I assist you today?",
    isUser: false,
    timestamp: new Date(),
  }
];

export function SupportBotEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHumanHelp, setShowHumanHelp] = useState(false);
  const [humanHelpData, setHumanHelpData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
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
      let botResponse: Message;
      
      if (text.toLowerCase().includes('customized') || text.toLowerCase().includes('offer') || text.toLowerCase().includes('help')) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Please provide your email, one of our specialists will contact you soon:",
          isUser: false,
          timestamp: new Date(),
          type: 'human_help'
        };
        setShowHumanHelp(true);
      } else if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Hello! How can I assist you today?",
          isUser: false,
          timestamp: new Date(),
        };
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "I'm here to help! What would you like to know about MailQuill?",
          isUser: false,
          timestamp: new Date(),
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleHumanHelpSubmit = () => {
    if (!humanHelpData.email.trim()) return;
    
    const helpMessage: Message = {
      id: Date.now().toString(),
      text: `Email submitted: ${humanHelpData.email}`,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, helpMessage]);
    setShowHumanHelp(false);
    setHumanHelpData({ fullName: '', email: '', phone: '' });
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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {/* Floating Button with Hover State */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
          {/* Hover Tooltip */}
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            How can we help you today?
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
          
          {/* Floating Button */}
          <Button
            onClick={toggleBot}
            className="h-12 w-12 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-white"></div>
            </div>
          </Button>
        </div>
      )}

      {/* Chat Window - Exact GaliChat Styling */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-16 right-2 sm:bottom-20 sm:right-4 z-50 w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] shadow-2xl border-0 bg-white transition-all duration-300",
          isMinimized ? "h-14" : "h-[500px] max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {/* GaliChat Style Logo - Exact Match */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base text-gray-900">Gali Bot Assistant</h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBot}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[420px] max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)]">
              {/* Messages - Exact GaliChat Styling */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {/* User Message - Exact Blue Bubble */}
                      {message.isUser && (
                        <div className="flex justify-end mb-2">
                          <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                            <p className="text-sm font-medium">{message.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Bot Message - Exact Gray Bubble */}
                      {!message.isUser && (
                        <div className="flex justify-start mb-2">
                          <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                            <p className="text-sm text-gray-900">{message.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Timestamp - Exact Styling */}
                      <div className="flex justify-center mb-4">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      {/* Human Help Form - Exact GaliChat Styling */}
                      {message.type === 'human_help' && showHumanHelp && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 mb-3">Human Help</p>
                          <p className="text-sm text-gray-700 mb-4">
                            Please provide your email, one of our specialists will contact you soon:
                          </p>
                          <div className="space-y-3">
                            <Input
                              placeholder="Full Name"
                              value={humanHelpData.fullName}
                              onChange={(e) => setHumanHelpData(prev => ({ ...prev, fullName: e.target.value }))}
                              className="w-full text-sm border-gray-300 focus:border-blue-500 bg-white"
                            />
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={humanHelpData.email}
                              onChange={(e) => setHumanHelpData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full text-sm border-gray-300 focus:border-blue-500 bg-white"
                            />
                            <Input
                              placeholder="Phone Number"
                              value={humanHelpData.phone}
                              onChange={(e) => setHumanHelpData(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full text-sm border-gray-300 focus:border-blue-500 bg-white"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleHumanHelpSubmit}
                                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-1 h-8 rounded-md"
                              >
                                Send
                              </Button>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-sm h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                Human Help
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-sm h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowHumanHelp(false)}
                              >
                                Finish Conversation
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-2">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 shadow-sm">
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

              {/* Input Area - Exact GaliChat Styling */}
              <div className="p-4 border-t border-gray-100 bg-white">
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
                    placeholder="Ask me anything..."
                    className="flex-1 text-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    size="sm"
                    disabled={!inputValue.trim() || isTyping}
                    className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>

              {/* Footer - Exact GaliChat Styling */}
              <div className="px-4 pb-3">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500">Powered by GaliChat</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}