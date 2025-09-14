'use client';

import { Button } from '@/components/ui/button';
import { MailQuillIcon } from '@/components/ui/MailQuillIcon';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onClose: () => void;
}

export function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between px-6 border-b border-white/20 dark:border-slate-700/50 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
          <MailQuillIcon variant="gradient" size="sm" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          MailQuill
        </h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
