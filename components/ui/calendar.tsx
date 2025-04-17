"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <>
      {/* Add global styles to fix the calendar alignment */}
      <style jsx global>{`
        .rdp-head_cell {
          width: 40px !important;
          text-align: center !important;
          font-weight: 500 !important;
          text-transform: uppercase;
          font-size: 0.75rem;
          padding-bottom: 0.5rem;
        }
        
        .rdp-cell {
          width: 40px !important;
          height: 36px !important;
          text-align: center !important;
        }
        
        .rdp-head_row {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }
        
        .rdp-row {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }
      `}</style>

      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "rdp-head_row",
          head_cell: "rdp-head_cell",
          row: "rdp-row mt-2",
          cell: "rdp-cell p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
