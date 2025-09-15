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

  const isDateValid = selectedDate && selectedDate > new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
          <Clock className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Campaign Timing</span>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={timingOption}
          onValueChange={handleTimingOptionChange}
          disabled={disabled}
          className="space-y-3"
        >
          {/* Start Now Option */}
          <div className="flex items-center space-x-3 p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 transition-all duration-200">
            <RadioGroupItem value="now" id="start-now" className="border-cyan-300 text-cyan-600" />
            <Label htmlFor="start-now" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Play className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-cyan-700 dark:text-cyan-300">Start Now</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Launch the campaign immediately after creation
              </p>
            </Label>
          </div>

          {/* Schedule Option */}
          <div className="flex items-center space-x-3 p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 transition-all duration-200">
            <RadioGroupItem value="schedule" id="schedule" className="border-cyan-300 text-cyan-600" />
            <Label htmlFor="schedule" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <CalendarIcon className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-cyan-700 dark:text-cyan-300">Schedule for Later</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Set a specific date and time to start the campaign
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* Schedule Configuration */}
        {timingOption === 'schedule' && (
          <div className="space-y-4 p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Schedule Details</h4>
              {isScheduled && scheduledFor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSchedule}
                  disabled={disabled}
                  className="text-cyan-600 hover:text-cyan-800 hover:bg-cyan-100 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-900/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel Schedule
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="schedule-date" className="text-sm text-cyan-700 dark:text-cyan-300">
                  Date
                </Label>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400",
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label htmlFor="schedule-time" className="text-sm text-cyan-700 dark:text-cyan-300">
                  Time
                </Label>
                <input
                  id="schedule-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-cyan-200 dark:border-cyan-800 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  disabled={disabled}
                  aria-label="Select time for campaign start"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 border border-cyan-300 dark:border-cyan-700 rounded-lg">
                <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-cyan-700 dark:text-cyan-300">
                  Campaign will start on{' '}
                  <span className="font-medium">
                    {format(selectedDate, 'PPP')} at {selectedTime}
                  </span>
                </span>
              </div>
            )}

            <Button
              onClick={handleSchedule}
              disabled={!isDateValid || disabled}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isScheduled ? 'Update Schedule' : 'Confirm Schedule'}
            </Button>
          </div>
        )}

        {/* Current Schedule Display */}
        {isScheduled && scheduledFor && timingOption === 'schedule' && (
          <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <CalendarIcon className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">Currently scheduled for:</span>
              <span>{format(new Date(scheduledFor), 'PPP p')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
