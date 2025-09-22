'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

interface LogoutOverlayProps {
  isVisible: boolean;
}

export const LogoutOverlay: React.FC<LogoutOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-cyan-200 dark:border-cyan-800 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Logging out...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we sign you out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
