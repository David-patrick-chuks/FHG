'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, TrendingUp, Users, Clock } from 'lucide-react';

export function CampaignOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Campaign Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Campaigns</span>
              <Badge variant="secondary">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Sent</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open Rate</span>
              <span className="font-medium text-green-600">24.3%</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Click Rate</span>
              <span className="font-medium text-blue-600">3.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reply Rate</span>
              <span className="font-medium text-purple-600">1.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <span className="font-medium text-red-600">2.1%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Recent Campaigns</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Welcome Series</span>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Product Launch</span>
              <Badge variant="outline" className="text-xs">Draft</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Newsletter</span>
              <Badge variant="outline" className="text-xs">Completed</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
