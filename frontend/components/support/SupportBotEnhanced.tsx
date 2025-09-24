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
  ExternalLink,
  Sparkles,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion' | 'action';
  actions?: Array<{
    text: string;
    action: string;
    type: 'link' | 'button';
    href?: string;
  }>;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "👋 Welcome to MailQuill! I'm your AI assistant. I can help you learn about our email marketing platform, pricing, features, and more. What would you like to know?",
    isUser: false,
    timestamp: new Date(),
    actions: [
      { text: '🚀 Get Started', action: 'get_started', type: 'button' },
      { text: '💰 View Pricing', action: 'pricing', type: 'button' },
      { text: '✨ See Features', action: 'features', type: 'button' },
    ]
  }
];

const quickActions = [
  { 
    id: '1', 
    text: 'Get Started', 
    action: 'get_started',
    icon: '🚀',
    description: 'Learn how to create your first campaign'
  },
  { 
    id: '2', 
    text: 'Pricing Plans', 
    action: 'pricing',
    icon: '💰',
    description: 'Compare our pricing options'
  },
  { 
    id: '3', 
    text: 'AI Features', 
    action: 'ai_features',
    icon: '✨',
    description: 'Discover our AI capabilities'
  },
  { 
    id: '4', 
    text: 'Contact Support', 
    action: 'contact',
    icon: '💬',
    description: 'Get help from our team'
  },
];

const popularQuestions = [
  {
    question: "How does AI email generation work?",
    answer: "Our AI analyzes your brand voice and audience to create personalized, engaging email content. It learns from your preferences and improves over time!",
    icon: Sparkles
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes basic email campaigns, 1,000 contacts, and essential templates. Perfect for getting started!",
    icon: Zap
  },
  {
    question: "Can I integrate with my existing tools?",
    answer: "Yes! We integrate with popular CRM systems, e-commerce platforms, and analytics tools. We also offer a comprehensive API.",
    icon: Users
  },
  {
    question: "How do I improve my email open rates?",
    answer: "Our AI optimizes send times, subject lines, and content based on your audience's behavior patterns for maximum engagement.",
    icon: TrendingUp
  },
];

export function SupportBotEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
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
    setShowQuickActions(false);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pricing') || input.includes('price') || input.includes('cost')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "💰 Here's our pricing structure:\n\n🆓 **Free Plan**: $0/month\n• 1,000 contacts\n• Basic email campaigns\n• Essential templates\n\n💼 **Pro Plan**: $29/month\n• 10,000 contacts\n• AI content generation\n• Advanced automation\n• Analytics & reporting\n\n🏢 **Enterprise**: $99/month\n• Unlimited contacts\n• Custom integrations\n• Priority support\n• Advanced AI features\n\nWould you like to see our pricing page or have questions about a specific plan?",
        isUser: false,
        timestamp: new Date(),
        actions: [
          { text: 'View Pricing Page', action: 'view_pricing', type: 'link', href: '/pricing' },
          { text: 'Start Free Trial', action: 'start_trial', type: 'link', href: '/signup' },
        ]
      };
    }
    
    if (input.includes('feature') || input.includes('what can') || input.includes('capabilities')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "✨ MailQuill offers powerful features to supercharge your email marketing:\n\n🤖 **AI-Powered Content Generation**\n• Smart subject line optimization\n• Personalized email content\n• Brand voice learning\n\n⚡ **Advanced Automation**\n• Drip campaigns\n• Behavioral triggers\n• A/B testing\n\n📊 **Analytics & Insights**\n• Real-time performance tracking\n• Audience segmentation\n• ROI optimization\n\n🔗 **Integrations**\n• CRM systems\n• E-commerce platforms\n• Analytics tools\n\nWould you like to learn more about any specific feature?",
        isUser: false,
        timestamp: new Date(),
        actions: [
          { text: 'View All Features', action: 'view_features', type: 'link', href: '/features' },
          { text: 'See AI in Action', action: 'ai_demo', type: 'button' },
        ]
      };
    }
    
    if (input.includes('start') || input.includes('begin') || input.includes('getting started')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "🚀 Great choice! Here's how to get started with MailQuill:\n\n1️⃣ **Sign up for free** - No credit card required\n2️⃣ **Import your contacts** - Connect your existing list\n3️⃣ **Choose a template** - Or let AI create one for you\n4️⃣ **Send your first campaign** - In just a few clicks!\n\nOur onboarding process takes less than 5 minutes, and you'll have your first campaign ready to go. Need help with any of these steps?",
        isUser: false,
        timestamp: new Date(),
        actions: [
          { text: 'Sign Up Now', action: 'signup', type: 'link', href: '/signup' },
          { text: 'Watch Tutorial', action: 'tutorial', type: 'button' },
        ]
      };
    }
    
    if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "💬 I'm here to help! For additional support:\n\n📧 **Email**: support@mailquill.com\n📞 **Phone**: +1 (555) 123-4567\n💬 **Live Chat**: Available 9 AM - 6 PM EST\n📚 **Help Center**: Comprehensive guides and tutorials\n\nOur support team typically responds within 24 hours. For urgent issues, please call us directly!",
        isUser: false,
        timestamp: new Date(),
        actions: [
          { text: 'Visit Help Center', action: 'help_center', type: 'link', href: '/help-center' },
          { text: 'Contact Form', action: 'contact_form', type: 'link', href: '/contact' },
        ]
      };
    }
    
    if (input.includes('ai') || input.includes('artificial intelligence')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "🤖 Our AI technology is what makes MailQuill special:\n\n🧠 **Smart Content Creation**\n• Analyzes your brand voice\n• Creates engaging subject lines\n• Generates personalized content\n\n📈 **Performance Optimization**\n• Learns from your audience's behavior\n• Optimizes send times\n• Improves open and click rates\n\n🎯 **Personalization Engine**\n• Dynamic content insertion\n• Behavioral targeting\n• Predictive analytics\n\nThe AI gets smarter with every campaign you send!",
        isUser: false,
        timestamp: new Date(),
        actions: [
          { text: 'Try AI Demo', action: 'ai_demo', type: 'button' },
          { text: 'Learn More', action: 'ai_info', type: 'button' },
        ]
      };
    }
    
    // Default response
    return {
      id: (Date.now() + 1).toString(),
      text: "That's a great question! I'd be happy to help you with that. Here are some popular topics I can assist with:\n\n• Getting started with MailQuill\n• Pricing and plans\n• AI features and capabilities\n• Integrations and setup\n• Best practices for email marketing\n\nCould you provide a bit more detail, or would you like me to connect you with our support team?",
      isUser: false,
      timestamp: new Date(),
      actions: [
        { text: 'Contact Support', action: 'contact_support', type: 'link', href: '/contact' },
        { text: 'Browse Help Center', action: 'help_center', type: 'link', href: '/help-center' },
      ]
    };
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'get_started':
        message = 'How do I get started with MailQuill?';
        break;
      case 'pricing':
        message = 'What are your pricing plans?';
        break;
      case 'ai_features':
        message = 'Tell me about your AI features';
        break;
      case 'contact':
        message = 'I need to contact support';
        break;
      default:
        message = action;
    }
    handleSendMessage(message);
  };

  const handleActionClick = (action: any) => {
    if (action.type === 'link' && action.href) {
      window.open(action.href, '_blank');
    } else {
      handleQuickAction(action.action);
    }
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
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="icon"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-semibold">
            !
          </span>
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Need help? Chat with us!
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-6 right-6 z-50 w-96 shadow-2xl border-0 bg-white dark:bg-gray-800 transition-all duration-300",
          isMinimized ? "h-16" : "h-[500px]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">MailQuill Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-100">Online now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBot}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[420px]">
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
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                          message.isUser
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        )}
                      >
                        <div className="whitespace-pre-line">{message.text}</div>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        
                        {/* Action buttons */}
                        {message.actions && (
                          <div className="mt-3 space-y-2">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.type === 'link' ? 'outline' : 'secondary'}
                                size="sm"
                                onClick={() => handleActionClick(action)}
                                className="w-full text-xs h-8"
                              >
                                {action.text}
                                {action.type === 'link' && <ExternalLink className="h-3 w-3 ml-1" />}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 text-sm">
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

              {/* Quick Actions */}
              {showQuickActions && messages.length === 1 && (
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs text-gray-500 mb-3 font-medium">Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.action)}
                        className="text-xs h-auto p-3 flex flex-col items-center space-y-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <span className="text-lg">{action.icon}</span>
                        <span className="font-medium">{action.text}</span>
                        <span className="text-xs text-gray-500">{action.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white dark:bg-gray-800">
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
                    placeholder="Ask me anything about MailQuill..."
                    className="flex-1 text-sm border-gray-200 dark:border-gray-600 focus:border-blue-500"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    size="sm"
                    disabled={!inputValue.trim() || isTyping}
                    className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
