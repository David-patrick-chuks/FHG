'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    Compass,
    MessageCircle,
    Send,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'lead_capture';
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
  const [emailValue, setEmailValue] = useState('');
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
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! One of our specialists will contact you soon.",
        isUser: false,
        timestamp: new Date(),
        type: 'lead_capture'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleEmailSubmit = () => {
    if (!emailValue.trim()) return;
    
    const emailMessage: Message = {
      id: Date.now().toString(),
      text: `Email submitted: ${emailValue}`,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, emailMessage]);
    setEmailValue('');
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
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={toggleBot}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-20 right-6 z-50 w-80 shadow-2xl border border-gray-200 bg-white transition-all duration-300",
          isMinimized ? "h-14" : "h-[500px]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Compass className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">MailQuill Assistant</h3>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBot}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[420px]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {/* User Message */}
                      {message.isUser && (
                        <div className="flex justify-end mb-2">
                          <div className="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%]">
                            <p className="text-sm font-medium">{message.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Bot Message */}
                      {!message.isUser && (
                        <div className="flex justify-start mb-2">
                          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-[80%]">
                            <p className="text-sm text-gray-900">{message.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className="flex justify-center mb-4">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      {/* Lead Capture Section */}
                      {message.type === 'lead_capture' && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-900 mb-3">
                            Please provide your email, one of our specialists will contact you soon:
                          </p>
                          <div className="space-y-2">
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={emailValue}
                              onChange={(e) => setEmailValue(e.target.value)}
                              className="w-full text-sm border-gray-300 focus:border-blue-500"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleEmailSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 h-8"
                              >
                                Send
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-center mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(new Date())} Leads
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-2">
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
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

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
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
                    className="flex-1 text-sm border-gray-300 focus:border-blue-500"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    size="sm"
                    disabled={!inputValue.trim() || isTyping}
                    className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pb-2">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500">Powered by MailQuill</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}