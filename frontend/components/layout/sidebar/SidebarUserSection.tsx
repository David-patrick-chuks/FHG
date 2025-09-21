'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

interface SidebarUserSectionProps {
  user: {
    username?: string;
    email?: string;
  } | null;
  onLogout: () => void;
  collapsed: boolean;
}

export function SidebarUserSection({ user, onLogout, collapsed }: SidebarUserSectionProps) {
  return (
    <div className="border-t border-white/20 dark:border-slate-700/50 p-3 flex-shrink-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
      {!collapsed ? (
        <>
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.username
                  ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()
                  : 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={onLogout}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60 rounded-lg transition-all duration-300"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-8 h-8 text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60 rounded-lg transition-all duration-300 group relative"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
