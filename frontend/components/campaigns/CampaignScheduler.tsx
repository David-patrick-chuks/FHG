'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface CampaignSchedulerProps {
  campaignId: string;
  onSchedule: (scheduledFor: Date) => void;
  onStartNow: () => void;
  isScheduled?: boolean;
  scheduledFor?: Date;
  disabled?: boolean;
  onScheduleConfirmed?: (confirmed: boolean) => void;
}

export function CampaignScheduler({
  campaignId,
  onSchedule,
  onStartNow,
  isScheduled = false,
  scheduledFor,
  disabled = false,
  onScheduleConfirmed
}: CampaignSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduledFor ? new Date(scheduledFor) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    scheduledFor ? format(new Date(scheduledFor), 'HH:mm') : '09:00'
  );
  const [isOpen, setIsOpen] = useState(false);
  const [timingOption, setTimingOption] = useState<'now' | 'schedule'>(
    isScheduled ? 'schedule' : 'now'
  );
  const [scheduleConfirmed, setScheduleConfirmed] = useState(!isScheduled); // Default to true for "Start Now"

  // Notify parent component when schedule confirmation state changes
  useEffect(() => {
    if (onScheduleConfirmed) {
      onScheduleConfirmed(scheduleConfirmed);
    }
  }, [scheduleConfirmed, onScheduleConfirmed]);

  const handleSchedule = () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    onSchedule(scheduledDateTime);
    setScheduleConfirmed(true);
    setIsOpen(false);
  };

  const handleStartNow = () => {
    onStartNow();
    setScheduleConfirmed(true);
  };

  const handleCancelSchedule = () => {
    onStartNow(); // This will clear the scheduled time
    setTimingOption('now');
    setSelectedDate(undefined);
    setScheduleConfirmed(false);
  };

  const handleTimingOptionChange = (value: 'now' | 'schedule') => {
    setTimingOption(value);
    if (value === 'now') {
      onStartNow();
      setScheduleConfirmed(true);
    } else {
      setScheduleConfirmed(false);
    }
  };

  // Allow scheduling for today (same day) but not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const isDateValid = selectedDate && selectedDate >= today;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Campaign Timing</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choose when to launch your campaign</p>
      </div>

      <div className="space-y-3">
        <RadioGroup
          value={timingOption}
          onValueChange={handleTimingOptionChange}
          disabled={disabled}
          className="space-y-3"
        >
          {/* Start Now Option */}
          <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer">
            <RadioGroupItem value="now" id="start-now" className="border-blue-300 text-blue-600" />
            <Label htmlFor="start-now" className="flex-1 cursor-pointer">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Start Now</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Launch the campaign immediately after creation
                </p>
              </div>
            </Label>
          </div>

          {/* Schedule Option */}
          <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer">
            <RadioGroupItem value="schedule" id="schedule" className="border-blue-300 text-blue-600" />
            <Label htmlFor="schedule" className="flex-1 cursor-pointer">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Schedule for Later</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set a specific date and time to start the campaign
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* Schedule Configuration */}
        {timingOption === 'schedule' && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Schedule Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Choose any date from today onwards
                </p>
              </div>
              {isScheduled && scheduledFor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSchedule}
                  disabled={disabled}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </Label>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </Label>
                <input
                  id="schedule-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  aria-label="Select time for campaign start"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Campaign will start on{' '}
                  <span className="font-semibold">
                    {format(selectedDate, 'PPP')} at {selectedTime}
                  </span>
                </p>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Make sure the time is in the future
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleSchedule}
              disabled={!isDateValid || disabled}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isScheduled ? 'Update Schedule' : 'Confirm Schedule'}
            </Button>
            
            {!scheduleConfirmed && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Please confirm your schedule details before creating the campaign
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Schedule Display */}
        {isScheduled && scheduledFor && timingOption === 'schedule' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="font-medium text-green-900 dark:text-green-100">
              Scheduled for: {format(new Date(scheduledFor), 'PPP p')}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Campaign is ready to launch at the scheduled time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
