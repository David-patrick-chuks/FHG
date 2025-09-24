'use client';

import { Button } from '@/components/ui/button';
import { Menu, PanelLeft } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  navigation?: React.ReactNode;
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ 
  title, 
  description, 
  actions, 
  navigation,
  onMenuClick,
  sidebarCollapsed = false,
  onToggleSidebar
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
      <div className="space-y-3">
        {/* Mobile: Stack everything vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Title and description section */}
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400 flex-shrink-0 mt-0.5"
              onClick={onMenuClick}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            {/* Desktop sidebar toggle button - only show when sidebar is collapsed */}
            {onToggleSidebar && sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 flex-shrink-0 mt-0.5"
                onClick={onToggleSidebar}
                title="Show sidebar"
              >
                <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h1>
              )}
              {description && (
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions section - better mobile layout */}
          {actions && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
        
        {navigation && (
          <div className="flex items-center">
            {navigation}
          </div>
        )}
      </div>
    </header>
  );
}
