'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Mail } from 'lucide-react';
import { useState } from 'react';

interface EmailIntervalSelectorProps {
  emailInterval: number;
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
  onIntervalChange: (interval: number, unit: 'seconds' | 'minutes' | 'hours') => void;
  disabled?: boolean;
}

export function EmailIntervalSelector({
  emailInterval,
  emailIntervalUnit,
  onIntervalChange,
  disabled = false
}: EmailIntervalSelectorProps) {
  const [isEnabled, setIsEnabled] = useState(emailInterval > 0);
  const [interval, setInterval] = useState(emailInterval || 2);
  const [unit, setUnit] = useState<'seconds' | 'minutes' | 'hours'>(emailIntervalUnit || 'minutes');

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      onIntervalChange(interval, unit);
    } else {
      onIntervalChange(0, 'minutes');
    }
  };

  const handleIntervalChange = (value: string) => {
    const newInterval = parseInt(value) || 0;
    setInterval(newInterval);
    if (isEnabled) {
      onIntervalChange(newInterval, unit);
    }
  };

  const handleUnitChange = (newUnit: 'seconds' | 'minutes' | 'hours') => {
    setUnit(newUnit);
    if (isEnabled) {
      onIntervalChange(interval, newUnit);
    }
  };

  const getIntervalDescription = () => {
    if (!isEnabled || interval === 0) {
      return 'All emails will be sent at once';
    }
    
    const unitText = interval === 1 ? unit.slice(0, -1) : unit;
    return `Emails will be sent every ${interval} ${unitText}`;
  };

  const getMaxValue = () => {
    switch (unit) {
      case 'seconds':
        return 3600; // 1 hour max
      case 'minutes':
        return 1440; // 24 hours max
      case 'hours':
        return 24; // 24 hours max
      default:
        return 1440;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Email Sending Interval</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="interval-enabled"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
          <Label htmlFor="interval-enabled" className="text-sm">
            Enable email intervals
          </Label>
        </div>

        {isEnabled && (
          <div className="space-y-3 pl-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="interval-value" className="text-sm text-gray-600">
                  Send emails every
                </Label>
                <Input
                  id="interval-value"
                  type="number"
                  min="1"
                  max={getMaxValue()}
                  value={interval}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor="interval-unit" className="text-sm text-gray-600">
                  Unit
                </Label>
                <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">{getIntervalDescription()}</span>
            </div>
          </div>
        )}

        {!isEnabled && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Mail className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">All emails will be sent at once</span>
          </div>
        )}
      </div>
    </div>
  );
}
