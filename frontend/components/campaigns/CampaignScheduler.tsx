'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';

interface CampaignSchedulerProps {
  campaignId: string;
  onSchedule: (scheduledFor: Date) => Promise<void>;
  onStartNow: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      await onSchedule(scheduledDateTime);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to schedule campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNow = async () => {
    setIsLoading(true);
    try {
      await onStartNow();
    } catch (error) {
      console.error('Failed to start campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDateValid = selectedDate && selectedDate > new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Campaign Timing</span>
      </div>

      {isScheduled && scheduledFor ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Scheduled for:</span>
            <span>{format(new Date(scheduledFor), 'PPP p')}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSchedule}
              disabled={!isDateValid || isLoading || disabled}
              className="flex-1"
            >
              {isLoading ? 'Scheduling...' : 'Schedule Campaign'}
            </Button>
            
            <Button
              onClick={handleStartNow}
              variant="outline"
              disabled={isLoading || disabled}
              className="flex-1"
            >
              {isLoading ? 'Starting...' : 'Start Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
