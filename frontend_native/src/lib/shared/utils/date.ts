/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';

export function formatDate(date: Date | string, pattern: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
}

export function formatTime(date: Date | string, pattern: string = 'p'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
}

export function formatDateTime(date: Date | string, pattern: string = 'PPp'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
}

export function formatRelativeTime(date: Date | string, baseDate: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, baseDate, { addSuffix: true });
}

export function formatSmartDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'p')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'p')}`;
  }
  
  return format(dateObj, 'PPp');
}

