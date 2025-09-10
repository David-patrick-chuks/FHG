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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Logging out...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Please wait while we sign you out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
