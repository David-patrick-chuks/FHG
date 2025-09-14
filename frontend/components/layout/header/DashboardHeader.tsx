'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  onMenuClick: () => void;
}

export function DashboardHeader({ 
  title, 
  description, 
  actions, 
  onMenuClick 
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <div className="text-slate-600 dark:text-slate-300 mt-1">
                {description}
              </div>
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
  );
}
