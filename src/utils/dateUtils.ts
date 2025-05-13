/**
 * Date utility functions for the Calendar View application
 *
 * Note: For testing purposes, we're using May 11, 2025 as "today"
 * This allows us to test the application with future dates
 */

/**
 * Format a date to a string in the format "YYYY-MM-DD"
 */
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse it
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } else {
    return date.toISOString().split('T')[0];
  }
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const today = getCurrentDate();

  // Parse the date properly
  let d: Date;
  if (typeof date === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      d = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the current week
 * Using our custom week numbering system (Week 1 starts on May 12, 2025)
 */
export const isThisWeek = (date: Date | string): boolean => {
  const today = getCurrentDate();

  // Calculate the current week number based on our reference date (May 12, 2025)
  const referenceDate = new Date(2025, 4, 12); // May 12, 2025
  const daysSinceReference = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeekNumber = Math.max(1, Math.floor(daysSinceReference / 7) + 1);

  // Use our isInWeek function to check if the date is in the current week
  return isInWeek(date, currentWeekNumber);
};

/**
 * Check if a date is in a specific week based on our custom week numbering
 * (Week 1 starts on May 12, 2025)
 */
export const isInWeek = (date: Date | string, weekNumber: number): boolean => {
  // Parse the date properly
  let d: Date;
  if (typeof date === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [dateYear, month, day] = date.split('-').map(num => parseInt(num, 10));
      d = new Date(dateYear, month - 1, day); // month is 0-indexed in JS Date
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  // Get the start and end dates for the specified week
  const weekStart = getWeekStartDate(weekNumber);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Set times to include the full days
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

  // Check if the date falls within this week
  return d >= weekStart && d <= weekEnd;
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  // For testing purposes, we're using May 11, 2025 as "today"
  // This allows us to test the application with future dates
  const now = getCurrentDate();

  // Parse the date properly
  let d: Date;
  if (typeof date === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      d = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      // Set to end of day to ensure full day comparison
      d.setHours(23, 59, 59, 999);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  return d < now;
};

/**
 * Get the current date
 * Previously used a hardcoded date (May 11, 2025) for testing purposes
 * Now returns the actual current date
 */
export const getCurrentDate = (): Date => {
  // Return the actual current date
  return new Date();
};

/**
 * Get the number of days between two dates
 */
export const getDaysBetween = (date1: Date | string, date2: Date | string): number => {
  // Parse the dates properly
  let d1: Date;
  let d2: Date;

  // Parse date1
  if (typeof date1 === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date1)) {
      const [year, month, day] = date1.split('-').map(num => parseInt(num, 10));
      d1 = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } else {
      d1 = new Date(date1);
    }
  } else {
    d1 = date1;
  }

  // Parse date2
  if (typeof date2 === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date2)) {
      const [year, month, day] = date2.split('-').map(num => parseInt(num, 10));
      d2 = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } else {
      d2 = new Date(date2);
    }
  } else {
    d2 = date2;
  }

  // Set both dates to midnight to ensure we're comparing full days
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get the color based on deadline proximity
 */
export const getDeadlineColor = (dueDate: Date | string): string => {
  const now = getCurrentDate();

  // Parse the date properly
  let due: Date;
  if (typeof dueDate === 'string') {
    // Handle date string in format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      const [year, month, day] = dueDate.split('-').map(num => parseInt(num, 10));
      due = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } else {
      due = new Date(dueDate);
    }
  } else {
    due = dueDate;
  }

  const daysLeft = getDaysBetween(now, due);

  if (isPast(dueDate)) {
    return 'text-red-600 bg-red-100'; // Overdue
  } else if (daysLeft <= 3) {
    return 'text-orange-600 bg-orange-100'; // Due soon
  } else if (daysLeft <= 7) {
    return 'text-yellow-600 bg-yellow-100'; // Due this week
  } else {
    return 'text-green-600 bg-green-100'; // Due later
  }
};

/**
 * Get the start date of a week based on week number
 * Using May 12, 2025 (Monday) as the reference point for Week 1
 */
export const getWeekStartDate = (weekNumber: number): Date => {
  // May 12, 2025 is a Monday - this is our reference point for Week 1
  const week1Start = new Date(2025, 4, 12); // Month is 0-indexed, so 4 = May

  // Calculate the start date of the target week
  const targetWeekStart = new Date(week1Start);
  targetWeekStart.setDate(week1Start.getDate() + (weekNumber - 1) * 7);

  return targetWeekStart;
};
