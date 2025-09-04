'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Bot,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  User,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { AuthGuard } from '../auth/AuthGuard';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Mail,
  },
  {
    label: 'Bots',
    href: '/dashboard/bots',
    icon: Bot,
  },
  {
    label: 'Audience',
    href: '/dashboard/audience',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    icon: Activity,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  


  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            FHG AI Bot
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            // Simplified active state logic
            let isActive = false;
            if (item.href === '/dashboard') {
              isActive = pathname === '/dashboard';
            } else {
              isActive = pathname.startsWith(item.href);
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                )} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <User className="mr-3 h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
      </AuthGuard>
  );
}
