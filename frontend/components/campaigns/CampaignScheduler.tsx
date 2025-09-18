'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Play, X } from 'lucide-react';
import { useState } from 'react';

interface CampaignSchedulerProps {
  campaignId: string;
  onSchedule: (scheduledFor: Date) => void;
  onStartNow: () => void;
  isScheduled?: boolean;
  scheduledFor?: Date;
  disabled?: boolean;
}

export function CampaignScheduler({
  campaignId,
  onSchedule,
  onStartNow,
  isScheduled = false,
  scheduledFor,
  disabled = false
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

  const handleSchedule = () => {
    if (!selectedDate) return;

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

    onSchedule(scheduledDateTime);
      setIsOpen(false);
  };

  const handleStartNow = () => {
    onStartNow();
  };

  const handleCancelSchedule = () => {
    onStartNow(); // This will clear the scheduled time
    setTimingOption('now');
    setSelectedDate(undefined);
  };

  const handleTimingOptionChange = (value: 'now' | 'schedule') => {
    setTimingOption(value);
    if (value === 'now') {
      onStartNow();
    }
  };

  // Allow scheduling for today (same day) but not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const isDateValid = selectedDate && selectedDate >= today;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Timing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose when to launch your campaign</p>
        </div>
      </div>

    <div className="space-y-4">
        <RadioGroup
          value={timingOption}
          onValueChange={handleTimingOptionChange}
          disabled={disabled}
          className="space-y-3"
        >
          {/* Start Now Option */}
          <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
            <RadioGroupItem value="now" id="start-now" className="border-blue-300 text-blue-600" />
            <Label htmlFor="start-now" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Start Now</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Launch the campaign immediately after creation
                  </p>
                </div>
              </div>
            </Label>
      </div>

          {/* Schedule Option */}
          <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
            <RadioGroupItem value="schedule" id="schedule" className="border-blue-300 text-blue-600" />
            <Label htmlFor="schedule" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Schedule for Later</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Set a specific date and time to start the campaign (including later today)
                  </p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* Schedule Configuration */}
        {timingOption === 'schedule' && (
          <div className="space-y-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            {/* Scheduling Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Flexible Scheduling Options
                  </h5>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>Today:</strong> Schedule for any time later today</li>
                    <li>• <strong>Future dates:</strong> Schedule for any date from tomorrow onwards</li>
                    <li>• <strong>Time validation:</strong> Times must be in the future</li>
                  </ul>
                </div>
          </div>
        </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Choose any date from today onwards, or schedule for later today
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
                  <X className="h-4 w-4 mr-1" />
                  Cancel Schedule
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                    <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        💡 You can schedule for today or any future date
                      </p>
                    </div>
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
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Campaign will start on{' '}
                    <span className="font-semibold">
                      {format(selectedDate, 'PPP')} at {selectedTime}
                    </span>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    {selectedDate.toDateString() === new Date().toDateString() 
                      ? '✅ Scheduled for today - make sure the time is in the future' 
                      : '📅 Scheduled for future date'}
                  </p>
                </div>
              </div>
            )}

            {/* Time validation warning for today */}
            {selectedDate && selectedDate.toDateString() === new Date().toDateString() && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Reminder:</strong> When scheduling for today, ensure the time is in the future from now.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSchedule}
              disabled={!isDateValid || disabled}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              {isScheduled ? 'Update Schedule' : 'Confirm Schedule'}
            </Button>
          </div>
        )}

        {/* Current Schedule Display */}
        {isScheduled && scheduledFor && timingOption === 'schedule' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Currently scheduled for: {format(new Date(scheduledFor), 'PPP p')}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  Campaign is ready to launch at the scheduled time
                </p>
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
