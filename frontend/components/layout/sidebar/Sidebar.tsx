'use client';

import { cn } from '@/lib/utils';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarUserSection } from './SidebarUserSection';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarItems: SidebarItem[];
  user: {
    username?: string;
    email?: string;
  } | null;
  onClose: () => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export function Sidebar({ 
  sidebarOpen, 
  sidebarCollapsed,
  sidebarItems, 
  user, 
  onClose, 
  onToggleCollapse,
  onLogout 
}: SidebarProps) {
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 transform transition-all duration-200 ease-in-out flex flex-col shadow-xl",
      sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full",
      sidebarCollapsed ? "lg:hidden" : "lg:translate-x-0 lg:w-64"
    )}>
      <SidebarHeader 
        onClose={onClose} 
        onToggleCollapse={onToggleCollapse}
        collapsed={sidebarCollapsed}
      />
      <SidebarNavigation 
        sidebarItems={sidebarItems} 
        onItemClick={onClose}
        collapsed={sidebarCollapsed}
      />
      <SidebarUserSection 
        user={user} 
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
      />
    </div>
  );
}
