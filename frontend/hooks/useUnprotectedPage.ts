'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Define unprotected routes where the support bot should appear
const UNPROTECTED_ROUTES = [
  '/',
  '/about',
  '/features',
  '/pricing',
  '/contact',
  '/help-center',
  '/api-docs',
  '/system-status',
  '/privacy',
  '/terms',
  '/cookies',
  '/app-password-guide',
  '/reset-password',
  '/signup',
  '/login',
];

// Define dashboard routes where the bot should NOT appear
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/admin',
];

export function useUnprotectedPage() {
  const pathname = usePathname();

  const isUnprotectedPage = useMemo(() => {
    // Check if current path is a dashboard route
    const isDashboardRoute = DASHBOARD_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    if (isDashboardRoute) {
      return false;
    }

    // Check if current path is an unprotected route
    const isUnprotectedRoute = UNPROTECTED_ROUTES.some(route => {
      if (route === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(route);
    });

    return isUnprotectedRoute;
  }, [pathname]);

  const shouldShowSupportBot = useMemo(() => {
    return isUnprotectedPage;
  }, [isUnprotectedPage]);

  return {
    isUnprotectedPage,
    shouldShowSupportBot,
    currentPath: pathname,
  };
}
