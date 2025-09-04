'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Activity {
  id: number;
  message: string;
  icon: any;
  iconColor: string;
  time: string;
  timestamp: Date;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Mock activity data generator
  const generateMockActivities = (page: number, limit: number) => {
    const allActivities = [
      {
        id: 1,
        message: 'Campaign "Q1 Sales Outreach" completed successfully',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        time: '2 hours ago',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        message: 'New bot "Customer Support Bot" activated',
        icon: Zap,
        iconColor: 'text-blue-600',
        time: '1 day ago',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        message: 'Open rate improved by 18% across all campaigns',
        icon: TrendingUp,
        iconColor: 'text-purple-600',
        time: '3 days ago',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        message: 'Campaign "Product Launch" started',
        icon: Mail,
        iconColor: 'text-orange-600',
        time: '5 days ago',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 5,
        message: 'Bot "Newsletter Bot" updated with new templates',
        icon: Bot,
        iconColor: 'text-indigo-600',
        time: '1 week ago',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 6,
        message: 'Campaign "Holiday Special" failed to send',
        icon: XCircle,
        iconColor: 'text-red-600',
        time: '1 week ago',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 7,
        message: '500 new contacts imported from CSV file',
        icon: Users,
        iconColor: 'text-cyan-600',
        time: '2 weeks ago',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 8,
        message: 'New bot "Lead Nurturing Bot" created',
        icon: Bot,
        iconColor: 'text-emerald-600',
        time: '2 weeks ago',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 9,
        message: 'Bounce rate exceeded threshold for Newsletter Weekly',
        icon: AlertCircle,
        iconColor: 'text-yellow-600',
        time: '3 weeks ago',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
      },
      {
        id: 10,
        message: 'Campaign "Black Friday Sale" scheduled',
        icon: Calendar,
        iconColor: 'text-pink-600',
        time: '1 month ago',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // Generate more activities for pagination demo
    const additionalActivities = [];
    for (let i = 11; i <= 50; i++) {
      const messages = [
        'Email sent successfully to 150 recipients',
        'Campaign performance report generated',
        'New subscriber added to mailing list',
        'Bot configuration updated',
        'Email template created',
        'Campaign paused by user',
        'Bounce rate alert triggered',
        'New campaign created',
        'Email delivery rate improved',
        'Bot deactivated due to low performance'
      ];
      
      const icons = [CheckCircle, Mail, Users, Bot, Calendar, AlertCircle, TrendingUp, Zap, XCircle];
      const colors = ['text-green-600', 'text-blue-600', 'text-purple-600', 'text-orange-600', 'text-indigo-600', 'text-red-600', 'text-cyan-600', 'text-emerald-600', 'text-yellow-600'];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomDays = Math.floor(Math.random() * 60) + 1;
      
      additionalActivities.push({
        id: i,
        message: randomMessage,
        icon: randomIcon,
        iconColor: randomColor,
        time: `${randomDays} days ago`,
        timestamp: new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000)
      });
    }

    const allActivitiesData = [...allActivities, ...additionalActivities];
    
    // Sort by timestamp (newest first)
    allActivitiesData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = allActivitiesData.slice(startIndex, endIndex);
    
    return {
      activities: paginatedActivities,
      totalItems: allActivitiesData.length,
      totalPages: Math.ceil(allActivitiesData.length / limit)
    };
  };

  // Fetch activities with pagination
  const fetchActivities = async (page: number, limit: number) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = generateMockActivities(page, limit);
      setActivities(result.activities);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load activities on component mount and when page/size changes
  useEffect(() => {
    fetchActivities(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track all activities and events across your email campaigns
            </p>
          </div>
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(pageSize)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                        <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {activity.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} activities
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
