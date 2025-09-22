import { TrackingLog } from '@/types';

export function useEmailExport() {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const exportToCSV = (emailRecords: TrackingLog[]) => {
    // Create CSV content
    const headers = ['Email', 'Status', 'Sent Date', 'Delivered Date', 'Opened Date', 'Replied Date', 'Error Message'];
    const csvContent = [
      headers.join(','),
      ...emailRecords.map(record => [
        record.recipientEmail,
        record.status,
        formatDate(record.sentAt),
        record.deliveredAt ? formatDate(record.deliveredAt) : '',
        record.openedAt ? formatDate(record.openedAt) : '',
        record.repliedAt ? formatDate(record.repliedAt) : '',
        record.errorMessage || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return { exportToCSV };
}
