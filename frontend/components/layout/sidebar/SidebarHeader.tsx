'use client';

import { Button } from '@/components/ui/button';
import { MailQuillIcon } from '@/components/ui/MailQuillIcon';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

interface SidebarHeaderProps {
  onClose: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
}

export function SidebarHeader({ onClose, onToggleCollapse, collapsed }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between px-3 lg:px-6 border-b border-white/20 dark:border-slate-700/50 flex-shrink-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className={cn(
          "bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0",
          collapsed ? "w-10 h-10" : "w-8 h-8"
        )}>
          <MailQuillIcon variant="gradient" size={collapsed ? "md" : "sm"} />
        </div>
        {!collapsed && (
          <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
            MailQuill
          </h1>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400 transition-colors"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
