'use client';

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
        <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
          <Mail className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Email Sending Interval</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="interval-enabled"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
          <Label htmlFor="interval-enabled" className="text-sm text-cyan-700 dark:text-cyan-300">
            Enable email intervals
          </Label>
        </div>

        {isEnabled && (
          <div className="space-y-3 pl-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="interval-value" className="text-sm text-cyan-700 dark:text-cyan-300">
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
                  className="mt-1 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400"
                />
              </div>
              
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="interval-unit" className="text-sm text-cyan-700 dark:text-cyan-300">
                  Unit
                </Label>
                <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
                  <SelectTrigger className="mt-1 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400">
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

            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
              <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-cyan-700 dark:text-cyan-300">{getIntervalDescription()}</span>
            </div>
          </div>
        )}

        {!isEnabled && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-1 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">All emails will be sent at once</span>
          </div>
        )}
      </div>
    </div>
  );
}
