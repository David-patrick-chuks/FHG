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
  sidebarItems: SidebarItem[];
  user: {
    username?: string;
    email?: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ 
  sidebarOpen, 
  sidebarItems, 
  user, 
  onClose, 
  onLogout 
}: SidebarProps) {
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col shadow-xl",
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <SidebarHeader onClose={onClose} />
      <SidebarNavigation 
        sidebarItems={sidebarItems} 
        onItemClick={onClose} 
      />
      <SidebarUserSection 
        user={user} 
        onLogout={onLogout} 
      />
    </div>
  );
}
