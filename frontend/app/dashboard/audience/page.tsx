'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EmailRecord {
  id: string;
  email: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  date: string;
  bot: string;
}

export default function AudiencePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 10;

  // Mock data for emails sent by bots
  const mockEmailRecords: EmailRecord[] = [
    {
      id: '1',
      email: 'john@techcorp.com',
      status: 'delivered',
      date: '2024-01-15 09:30 AM',
      bot: 'Sales Bot'
    },
    {
      id: '2',
      email: 'sarah@startup.io',
      status: 'sent',
      date: '2024-01-15 10:15 AM',
      bot: 'Marketing Bot'
    },
    {
      id: '3',
      email: 'mike@enterprise.com',
      status: 'delivered',
      date: '2024-01-15 11:00 AM',
      bot: 'Sales Bot'
    },
    {
      id: '4',
      email: 'lisa@innovation.co',
      status: 'failed',
      date: '2024-01-15 11:45 AM',
      bot: 'Onboarding Bot'
    },
    {
      id: '5',
      email: 'alex@consulting.com',
      status: 'delivered',
      date: '2024-01-15 12:30 PM',
      bot: 'Promo Bot'
    },
    {
      id: '6',
      email: 'emma@techstartup.com',
      status: 'sent',
      date: '2024-01-15 01:15 PM',
      bot: 'Marketing Bot'
    },
    {
      id: '7',
      email: 'david@enterprise.io',
      status: 'bounced',
      date: '2024-01-15 02:00 PM',
      bot: 'Sales Bot'
    },
    {
      id: '8',
      email: 'anna@innovation.com',
      status: 'delivered',
      date: '2024-01-15 02:45 PM',
      bot: 'Onboarding Bot'
    },
    {
      id: '9',
      email: 'tom@startup.co',
      status: 'sent',
      date: '2024-01-15 03:30 PM',
      bot: 'Promo Bot'
    },
    {
      id: '10',
      email: 'jessica@techcorp.io',
      status: 'delivered',
      date: '2024-01-15 04:15 PM',
      bot: 'Marketing Bot'
    },
    {
      id: '11',
      email: 'robert@enterprise.com',
      status: 'sent',
      date: '2024-01-15 05:00 PM',
      bot: 'Sales Bot'
    },
    {
      id: '12',
      email: 'sophia@innovation.io',
      status: 'delivered',
      date: '2024-01-15 05:45 PM',
      bot: 'Onboarding Bot'
    }
  ];

  // Filter and search logic
  const filteredEmails = mockEmailRecords.filter(email => {
    const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmails = filteredEmails.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    // Handle delete logic here
    console.log('Deleting email record:', id);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Email', 'Status', 'Date', 'Bot'];
    const csvContent = [
      headers.join(','),
      ...filteredEmails.map(email => [
        `"${email.email}"`,
        email.status,
        email.date,
        `"${email.bot}"`
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `email-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'bounced':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout
      title="Audience Management"
      description="Track emails sent by your bots and manage recipient lists"
      actions={
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Email List
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Records</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Emails sent by your bots to recipients
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Bot</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmails.map((email) => (
                    <tr key={email.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{email.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {email.date}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {email.bot}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(email.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEmails.length)} of {filteredEmails.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
