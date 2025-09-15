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
}

export function SidebarNavigation({ sidebarItems, onItemClick }: SidebarNavigationProps) {
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
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
            : "text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60 hover:shadow-sm"
        )}
        onClick={onItemClick}
      >
        <item.icon className={cn(
          "mr-3 h-5 w-5",
          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
        )} />
        {item.label}
        {item.badge && (
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {/* Regular navigation items */}
      {regularItems.map(renderNavigationItem)}
      
      {/* Admin section separator */}
      {adminItems.length > 0 && (
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
    </nav>
  );
}
