import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date-only string (YYYY-MM-DD) without timezone conversion.
 * This prevents the date from shifting due to timezone differences when
 * PostgreSQL date type is serialized as a string.
 */
export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  // Handle ISO date strings (YYYY-MM-DD) by parsing as local date
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Fallback to standard Date parsing
  return new Date(dateStr);
}
