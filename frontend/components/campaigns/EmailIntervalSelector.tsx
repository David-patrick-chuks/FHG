'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    // Allow 0 for "send all at once"
    const validInterval = Math.max(0, newInterval);
    setInterval(validInterval);
    if (isEnabled) {
      onIntervalChange(validInterval, unit);
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Sending Interval</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Control how frequently emails are sent</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Switch
            id="interval-enabled"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
          <Label htmlFor="interval-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable email intervals
          </Label>
        </div>

        {isEnabled && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval-value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send emails every
                </Label>
        <Input
          id="interval-value"
          type="number"
          min="0"
          max={getMaxValue()}
          value={interval}
          onChange={(e) => handleIntervalChange(e.target.value)}
          onBlur={(e) => {
            const value = parseInt(e.target.value) || 0;
            const validValue = Math.max(0, value);
            if (validValue !== interval) {
              setInterval(validValue);
              if (isEnabled) {
                onIntervalChange(validValue, unit);
              }
            }
          }}
          disabled={disabled}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Use 0 to send all emails at once
        </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interval-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </Label>
                <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400">
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

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">{getIntervalDescription()}</span>
            </div>
          </div>
        )}

        {!isEnabled && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">All emails will be sent at once</span>
          </div>
        )}
      </div>
    </div>
  );
}
