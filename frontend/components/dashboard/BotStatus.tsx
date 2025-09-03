'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Activity, Zap, AlertCircle } from 'lucide-react';

export function BotStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span>Bot Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Bots</span>
            <Badge variant="secondary">5</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Bots</span>
            <Badge variant="default" className="bg-green-100 text-green-800">3</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Emails Today</span>
            <span className="font-medium">127</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Bot Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sales Bot</span>
              </div>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Support Bot</span>
              </div>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Newsletter Bot</span>
              </div>
              <span className="text-yellow-600">Paused</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
