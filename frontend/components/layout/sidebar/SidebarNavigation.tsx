'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarNavigationProps {
  sidebarItems: SidebarItem[];
  onItemClick: () => void;
  collapsed: boolean;
}

export function SidebarNavigation({ sidebarItems, onItemClick, collapsed }: SidebarNavigationProps) {
  const pathname = usePathname();

  const regularItems = sidebarItems.slice(0, 10); // First 10 items are regular
  const adminItems = sidebarItems.slice(10); // Rest are admin items

  const renderNavigationItem = (item: SidebarItem) => {
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
          "flex items-center text-sm font-medium rounded-lg transition-all duration-300 group relative",
          collapsed ? "px-3 py-3 justify-center" : "px-3 py-2",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
            : "text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60 hover:shadow-sm"
        )}
        onClick={onItemClick}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn(
          "h-5 w-5",
          collapsed ? "" : "mr-3",
          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
        )} />
        {!collapsed && (
          <>
            {item.label}
            {item.badge && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {item.badge}
              </span>
            )}
          </>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1 px-1 py-0.5 bg-blue-600 text-white text-xs rounded">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {/* Regular navigation items */}
      {regularItems.map(renderNavigationItem)}
      
      {/* Admin section separator */}
      {adminItems.length > 0 && !collapsed && (
        <>
          <div className="my-4 border-t border-white/20 dark:border-slate-700/50"></div>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Admin
            </h3>
          </div>
          {adminItems.map(renderNavigationItem)}
        </>
      )}
      
      {/* Admin items when collapsed (no separator) */}
      {adminItems.length > 0 && collapsed && adminItems.map(renderNavigationItem)}
    </nav>
  );
}
