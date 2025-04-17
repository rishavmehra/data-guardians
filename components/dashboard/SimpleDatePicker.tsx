"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';

interface SimpleDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  onClose: () => void;
}

export default function SimpleDatePicker({ value, onChange, onClose }: SimpleDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const today = new Date();
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get all days in the current month, including some days from previous/next month to fill the calendar
  const daysToDisplay = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get day names for the header
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Check if a date is the currently selected date
  const isSelectedDate = (date: Date) => {
    return value ? date.toDateString() === value.toDateString() : false;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (isBefore(date, today) && !isToday(date)) {
      return; // Don't allow selecting dates in the past
    }
    onChange(date);
    onClose();
  };

  const days = daysToDisplay();

  // Calculate which day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  
  // Create array of empty cells for days before the first of the month
  const emptyCellsBefore = Array(firstDayOfMonth).fill(null);
  
  // Calculate placeholder days for the beginning of the month
  const allCells = [...emptyCellsBefore, ...days];

  return (
    <div className="p-3 bg-background rounded-md shadow-md border border-border">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={prevMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="w-full">
        {/* Day names header */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((day, index) => (
            <div 
              key={index} 
              className="text-center text-xs font-medium text-muted-foreground h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {allCells.map((day, index) => {
            if (!day) {
              // Empty cell
              return <div key={`empty-${index}`} className="h-8 w-8" />;
            }

            const isDisabled = isBefore(day, today) && !isToday(day);
            const isSelected = isSelectedDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <Button
                key={day.toString()}
                variant={isSelected ? "default" : "ghost"}
                size="icon"
                disabled={isDisabled}
                className={`h-8 w-8 p-0 ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : isToday(day) 
                      ? 'bg-accent text-accent-foreground' 
                      : ''
                } ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <span className="text-xs">{format(day, 'd')}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Cancel button */}
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { onChange(undefined); onClose(); }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
