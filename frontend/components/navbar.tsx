'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import {
    Bot,
    Brain,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Settings,
    User,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Mail },
    { name: 'Bots', href: '/dashboard/bots', icon: Bot },
  ];

  if (isLoading) {
    return (
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                FHG AI Bot
              </span>
            </Link>

            {/* Desktop navigation */}
            {!isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop authenticated navigation */}
                <div className="hidden md:flex md:space-x-4">
                  {authenticatedNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                          {user?.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Desktop auth buttons */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                {authenticatedNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/dashboard/profile"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors flex items-center space-x-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block w-full text-left px-3 py-2 text-base font-medium transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link
                    href="/login"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
