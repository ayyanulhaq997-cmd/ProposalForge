import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  disabled?: { before?: Date };
}

// Sanitize dates to ensure they're valid Date objects with correct values
const sanitizeDate = (date: any): Date | null => {
  if (!date) return null;
  
  try {
    // If it's already a valid Date, create a fresh copy
    if (date instanceof Date) {
      const sanitized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (isNaN(sanitized.getTime()) || sanitized.getFullYear() < 2000 || sanitized.getFullYear() > 2100) {
        return null;
      }
      return sanitized;
    }
  } catch (e) {
    console.error('Error sanitizing date:', date, e);
    return null;
  }
  
  return null;
};

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  disabled,
}: DateRangeSelectorProps) {
  // Start from current date to prevent invalid dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [displayMonth, setDisplayMonth] = useState<Date>(today);

  const handlePrevMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayMonth(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setDisplayMonth(today);
  };

  // Validate and ensure dates are in reasonable range
  const validateDate = (date: Date): boolean => {
    return date && date.getFullYear() >= 2000 && date.getFullYear() <= 2100;
  };

  // Sanitize the date range to ensure clean Date objects
  let validDateRange: DateRange | undefined = undefined;
  if (dateRange?.from && dateRange?.to) {
    const sanitizedFrom = sanitizeDate(dateRange.from);
    const sanitizedTo = sanitizeDate(dateRange.to);
    
    if (sanitizedFrom && sanitizedTo && validateDate(sanitizedFrom) && validateDate(sanitizedTo)) {
      validDateRange = { from: sanitizedFrom, to: sanitizedTo };
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Selected Dates Display */}
      {validDateRange?.from && validDateRange?.to ? (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Check-in</p>
              <p className="text-base font-semibold">
                {format(validDateRange.from, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(validDateRange.from, "EEEE")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Check-out</p>
              <p className="text-base font-semibold">
                {format(validDateRange.to, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(validDateRange.to, "EEEE")}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              {Math.ceil(
                (validDateRange.to.getTime() - validDateRange.from.getTime()) / (1000 * 60 * 60 * 24)
              )}{" "}
              night{Math.ceil(
                (validDateRange.to.getTime() - validDateRange.from.getTime()) / (1000 * 60 * 60 * 24)
              ) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 rounded-lg border text-center">
          <p className="text-sm text-muted-foreground">
            Select check-in and check-out dates
          </p>
        </div>
      )}

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between gap-2 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevMonth}
          data-testid="button-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <h3 className="font-semibold text-sm">
            {format(displayMonth, "MMMM yyyy")}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextMonth}
          data-testid="button-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="range"
          selected={validDateRange}
          onSelect={(range) => {
            if (!range) {
              onDateRangeChange(undefined);
              return;
            }

            // Sanitize selected dates before passing them up
            const from = range.from ? sanitizeDate(range.from) : undefined;
            const to = range.to ? sanitizeDate(range.to) : undefined;

            if (from && to && validateDate(from) && validateDate(to)) {
              onDateRangeChange({ from, to });
            } else if (from && validateDate(from)) {
              onDateRangeChange({ from });
            } else if (!from && !to) {
              onDateRangeChange(undefined);
            }
          }}
          month={displayMonth}
          onMonthChange={(month) => {
            if (month.getFullYear() >= 2000 && month.getFullYear() <= 2100) {
              setDisplayMonth(month);
            }
          }}
          numberOfMonths={1}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today || date.getFullYear() < 2000 || date.getFullYear() > 2100;
          }}
          className="rounded-md border"
          data-testid="calendar-date-picker"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleToday}
          data-testid="button-today"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(tomorrow);
            nextWeek.setDate(nextWeek.getDate() + 7);
            onDateRangeChange({ from: tomorrow, to: nextWeek });
            setDisplayMonth(tomorrow);
          }}
          data-testid="button-next-week"
        >
          Next 7 days
        </Button>
      </div>
    </div>
  );
}
