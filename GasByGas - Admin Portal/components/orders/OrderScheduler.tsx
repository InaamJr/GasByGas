'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

interface OrderSchedulerProps {
  onSchedule: (date: Date) => void;
}

export function OrderScheduler({ onSchedule }: OrderSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <Card className="p-6 rounded-[20px]">
      <h3 className="text-lg font-medium mb-4">Calendar</h3>
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border"
        />
        <div className="flex justify-end">
          <Button 
            className="bg-green-600 hover:bg-green-700 rounded-full"
            onClick={() => selectedDate && onSchedule(selectedDate)}
          >
            Schedule Order
          </Button>
        </div>
      </div>
    </Card>
  );
}