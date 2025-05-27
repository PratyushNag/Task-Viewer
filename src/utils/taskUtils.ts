/**
 * Task utility functions for styling and behavior
 */

import { Task } from '@/types';
import { isPast } from './dateUtils';

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  return !task.completed && isPast(task.dueDate);
};

/**
 * Get CSS classes for overdue task styling
 * Returns classes for a prominent red border that's visually striking but doesn't break design
 */
export const getOverdueClasses = (task: Task): string => {
  if (isTaskOverdue(task)) {
    return 'border-red-500 border-2 shadow-red-100';
  }
  return '';
};

/**
 * Get border classes specifically for task containers
 */
export const getTaskBorderClasses = (task: Task, defaultBorder: string = 'border-space-cadet/30'): string => {
  if (isTaskOverdue(task)) {
    return 'border-red-500 border-2';
  }
  return defaultBorder;
};

/**
 * Get text color classes for overdue tasks
 */
export const getOverdueTextClasses = (task: Task, defaultTextColor: string = ''): string => {
  if (isTaskOverdue(task)) {
    return 'text-red-600 font-medium';
  }
  return defaultTextColor;
};

/**
 * Get background color for calendar events (overdue tasks)
 */
export const getCalendarEventColor = (task: Task): string => {
  if (isTaskOverdue(task)) {
    return '#EF4444'; // Bright red for overdue tasks
  }

  // Return priority-based colors for non-overdue tasks
  if (task.completed) {
    return '#9CA3AF'; // Gray for completed tasks
  }

  switch (task.priority) {
    case 'high':
      return '#EF4444'; // Red for high priority
    case 'medium':
      return '#F59E0B'; // Yellow for medium priority
    case 'low':
      return '#3B82F6'; // Blue for low priority
    default:
      return '#3B82F6';
  }
};

/**
 * Generate overdue task rollover instances for future weeks
 * Returns virtual task instances that appear in subsequent weeks as visual reminders
 */
export const generateOverdueRolloverTasks = (
  tasks: Task[],
  currentWeekNumber: number,
  maxWeeksAhead: number = 10
): Task[] => {
  const rolloverTasks: Task[] = [];

  // Find all overdue incomplete tasks
  const overdueTasks = tasks.filter(task =>
    !task.completed && isTaskOverdue(task)
  );

  // For each overdue task, create rollover instances for current and future weeks
  overdueTasks.forEach(task => {
    // Determine the original week and day of the task
    const originalWeekNumber = task.weekNumber || 1;

    // Create rollover instances starting from current week and going into future weeks
    for (let weekOffset = 0; weekOffset <= maxWeeksAhead; weekOffset++) {
      const rolloverWeekNumber = currentWeekNumber + weekOffset;

      // Only create rollover if the task's original week has passed
      if (rolloverWeekNumber > originalWeekNumber) {
        const rolloverTask: Task = {
          ...task,
          id: `${task.id}-rollover-week-${rolloverWeekNumber}`, // Unique ID for rollover
          visualWeekNumber: rolloverWeekNumber,
          // Keep original due date unchanged
          dueDate: task.dueDate,
          startDate: task.startDate,
          weekNumber: task.weekNumber, // Keep original week number
        };

        rolloverTasks.push(rolloverTask);
      }
    }
  });

  return rolloverTasks;
};

/**
 * Check if a task is a rollover instance (virtual overdue reminder)
 */
export const isRolloverTask = (task: Task): boolean => {
  return task.id.includes('-rollover-week-');
};

/**
 * Get the original task ID from a rollover task
 */
export const getOriginalTaskId = (rolloverTask: Task): string => {
  if (isRolloverTask(rolloverTask)) {
    return rolloverTask.id.split('-rollover-week-')[0];
  }
  return rolloverTask.id;
};

/**
 * Get day offset based on task category for consistent positioning
 */
export const getDayOffsetFromCategory = (category?: string): number => {
  switch (category) {
    case 'GS Subject 1':
      return 0; // Monday
    case 'GS Subject 2 / Optional':
      return 1; // Tuesday
    case 'CSAT':
      return 2; // Wednesday
    case 'Current Affairs':
      return 4; // Friday
    case 'Weekly Test':
      return 6; // Sunday
    default:
      return 3; // Thursday for any other category
  }
};

/**
 * Get enhanced border classes for overdue and rollover tasks
 */
export const getEnhancedTaskBorderClasses = (task: Task, defaultBorder: string = 'border-space-cadet/30'): string => {
  if (isRolloverTask(task)) {
    // Bright red border for rollover tasks (overdue reminders)
    return 'border-red-600 border-4 shadow-lg shadow-red-200';
  }

  if (isTaskOverdue(task)) {
    // Standard red border for overdue tasks
    return 'border-red-500 border-2';
  }

  return defaultBorder;
};
