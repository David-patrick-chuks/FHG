import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrackingLog } from '@/types';

interface EmailRecordsTableProps {
  emailRecords: TrackingLog[];
}

export function EmailRecordsTable({ emailRecords }: EmailRecordsTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'opened':
        return 'outline';
      case 'replied':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'bounced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'sent':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'opened':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'replied':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'bounced':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sent Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Delivered</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Opened</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Replied</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Error</th>
              </tr>
            </thead>
            <tbody>
              {emailRecords.map((record) => (
                <tr key={record.emailId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {record.recipientEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={getStatusBadgeVariant(record.status)}
                      className={getStatusColor(record.status)}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(record.sentAt)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {record.deliveredAt ? formatDate(record.deliveredAt) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {record.openedAt ? formatDate(record.openedAt) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {record.repliedAt ? formatDate(record.repliedAt) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600 dark:text-red-400">
                    {record.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
