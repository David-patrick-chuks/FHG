import { Campaign } from '@/types';

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'running':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'stopped':
      return 'destructive';
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700';
    case 'paused':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    case 'completed':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    case 'stopped':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    case 'active':
      return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700';
    case 'inactive':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    case 'generating_messages':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

export const getProgressPercentage = (campaign: Campaign | null) => {
  if (!campaign) return 0;
  const total = campaign.emailList?.length || 0;
  const sent = campaign.sentEmails?.length || 0;
  return total > 0 ? Math.round((sent / total) * 100) : 0;
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};
