'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/contexts/UnreadCountContext';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bot,
    CreditCard,
    FileText,
    LayoutDashboard,
    Mail,
    Search,
    Shield,
    User,
    Users
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { AuthGuard } from '../auth/AuthGuard';
import { DashboardHeader } from './header';
import { Sidebar } from './sidebar';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const getSidebarItems = (unreadCount: number, isAdmin: boolean = false): SidebarItem[] => {
  console.log('getSidebarItems called with unreadCount:', unreadCount, 'type:', typeof unreadCount);
  const regularItems: SidebarItem[] = [
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
      label: 'Templates',
      href: '/dashboard/templates',
      icon: FileText,
    },
    {
      label: 'Bots',
      href: '/dashboard/bots',
      icon: Bot,
    },
    {
      label: 'Email Extractor',
      href: '/dashboard/email-extractor',
      icon: Search,
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
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: 'Payments',
      href: '/dashboard/payments',
      icon: CreditCard,
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
  ];

  // Debug logging for Activity item
  const activityItem = regularItems.find(item => item.label === 'Activity');
  console.log('Activity item in getSidebarItems:', activityItem);
  console.log('Activity item badge:', activityItem?.badge, 'unreadCount:', unreadCount);

  const adminItems: SidebarItem[] = [
    {
      label: 'Admin Dashboard',
      href: '/dashboard/admin',
      icon: Shield,
    },
    {
      label: 'User Management',
      href: '/dashboard/admin/users',
      icon: Users,
    },
    {
      label: 'Payment Management',
      href: '/dashboard/admin/payments',
      icon: CreditCard,
    },
    {
      label: 'System Activity',
      href: '/dashboard/admin/activity',
      icon: Activity,
    },
    {
      label: 'Template Approvals',
      href: '/dashboard/admin/templates',
      icon: FileText,
    },
    // {
    //   label: 'Incident Management',
    //   href: '/dashboard/admin/incidents',
    //   icon: AlertTriangle,
    // },
  ];

  return isAdmin ? [...regularItems, ...adminItems] : regularItems;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  navigation?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  actions,
  navigation
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Start expanded by default
  const { user, logout } = useAuth();
  const { unreadCount } = useUnreadCount();
  const pathname = usePathname();

  // Debug logging
  console.log('DashboardLayout unreadCount:', unreadCount, 'type:', typeof unreadCount);
  console.log('DashboardLayout component rendered with unreadCount:', unreadCount);

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          sidebarItems={getSidebarItems(unreadCount, user?.isAdmin)}
          user={user}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
          <div className="min-h-screen">
            <DashboardHeader
              title={title}
              description={description}
              actions={actions}
              navigation={navigation}
              onMenuClick={() => setSidebarOpen(true)}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Page content */}
            <main className="p-4 sm:p-6 lg:p-8 relative">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
