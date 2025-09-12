'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { Calendar, Shield } from 'lucide-react';

interface AccountDetailsProps {
  user: User;
}

export function AccountDetails({ user }: AccountDetailsProps) {
  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PRO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Current Plan</Label>
        <Badge className={getSubscriptionColor(user.subscription)}>
          {user.subscription.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label>Account Status</Label>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Member Since</Label>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{formatDate(user.createdAt)}</span>
        </div>
      </div>

      {user.subscription?.toUpperCase() !== 'FREE' && user.subscriptionExpiresAt && (
        <div className="space-y-2">
          <Label>Plan Expires</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{formatDate(user.subscriptionExpiresAt)}</span>
          </div>
        </div>
      )}

      {user.lastLoginAt && (
        <div className="space-y-2">
          <Label>Last Login</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{formatDate(user.lastLoginAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
