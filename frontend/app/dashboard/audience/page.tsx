'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users, Mail, Download, Upload } from 'lucide-react';
import { useState } from 'react';

export default function AudiencePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for now - will be replaced with API calls later
  const mockSubscribers = [
    { id: 1, email: 'john@example.com', status: 'active', subscribedAt: '2024-01-15', tags: ['newsletter', 'product'] },
    { id: 2, email: 'sarah@example.com', status: 'active', subscribedAt: '2024-01-10', tags: ['newsletter'] },
    { id: 3, email: 'mike@example.com', status: 'inactive', subscribedAt: '2024-01-05', tags: ['product'] },
    { id: 4, email: 'emma@example.com', status: 'active', subscribedAt: '2024-01-20', tags: ['newsletter', 'product', 'events'] },
  ];

  const filteredSubscribers = mockSubscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subscriber.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Audience Management"
      description="Manage your email subscribers and audience segments"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{mockSubscribers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {mockSubscribers.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Audience Segments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>Manage your email subscribers and their preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Search subscribers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="status">Filter by status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{subscriber.subscribedAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {subscriber.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredSubscribers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No subscribers found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start building your audience by adding your first subscriber'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
