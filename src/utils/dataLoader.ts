/**
 * Utility functions for loading data from MongoDB API
 */
import { Task, Milestone } from '@/types';
import { getPhaseForWeek } from './phaseUtils';

/**
 * Load tasks from MongoDB API
 */
export const loadTasksFromApi = async (): Promise<Task[]> => {
  try {
    const response = await fetch('/api/tasks');

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error loading tasks from API:', error);
    return [];
  }
};

/**
 * Load milestones from MongoDB API
 */
export const loadMilestonesFromApi = async (): Promise<Milestone[]> => {
  try {
    const response = await fetch('/api/milestones');

    if (!response.ok) {
      throw new Error('Failed to fetch milestones');
    }

    const milestones = await response.json();
    return milestones;
  } catch (error) {
    console.error('Error loading milestones from API:', error);
    return [];
  }
};

/**
 * Load tasks from JSON file (legacy)
 * This is kept for backward compatibility
 */
export const loadTasksFromJson = (): Task[] => {
  console.warn('loadTasksFromJson is deprecated. Use loadTasksFromApi instead.');
  return [];
};

/**
 * Load milestones from JSON file (legacy)
 * This is kept for backward compatibility
 */
export const loadMilestonesFromJson = (): Milestone[] => {
  console.warn('loadMilestonesFromJson is deprecated. Use loadMilestonesFromApi instead.');
  return [];
};

/**
 * Get tasks for a specific date
 */
export const getTasksForDate = (date: Date | string, tasks: Task[]): Task[] => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return tasks.filter(task => {
    const taskDateStr = typeof task.dueDate === 'string'
      ? task.dueDate
      : task.dueDate.toISOString().split('T')[0];
    return taskDateStr === dateStr;
  });
};

/**
 * Get milestones for a specific date
 */
export const getMilestonesForDate = (date: Date | string, milestones: Milestone[]): Milestone[] => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return milestones.filter(milestone => {
    const milestoneDateStr = typeof milestone.dueDate === 'string'
      ? milestone.dueDate
      : milestone.dueDate.toISOString().split('T')[0];
    return milestoneDateStr === dateStr;
  });
};

/**
 * Get tasks for a specific week
 */
export const getTasksForWeek = (weekNumber: number, tasks: Task[]): Task[] => {
  return tasks.filter(task => 'weekNumber' in task && task.weekNumber === weekNumber);
};

/**
 * Get milestones for a specific week
 */
export const getMilestonesForWeek = (weekNumber: number, milestones: Milestone[]): Milestone[] => {
  return milestones.filter(milestone => 'weekNumber' in milestone && milestone.weekNumber === weekNumber);
};

/**
 * Get all unique week numbers from tasks and milestones
 */
export const getAllWeekNumbers = (tasks: Task[], milestones: Milestone[]): number[] => {
  const weekNumbers = new Set<number>();

  tasks.forEach(task => {
    if ('weekNumber' in task && typeof task.weekNumber === 'number') {
      weekNumbers.add(task.weekNumber);
    }
  });

  milestones.forEach(milestone => {
    if ('weekNumber' in milestone && typeof milestone.weekNumber === 'number') {
      weekNumbers.add(milestone.weekNumber);
    }
  });

  return Array.from(weekNumbers).sort((a, b) => a - b);
};

/**
 * Get the date range for a specific week number
 * This is an approximation based on the first task/milestone in that week
 */
export const getDateRangeForWeek = (
  weekNumber: number,
  tasks: Task[],
  milestones: Milestone[]
): { start: string; end: string } | null => {
  const weekTasks = getTasksForWeek(weekNumber, tasks);
  const weekMilestones = getMilestonesForWeek(weekNumber, milestones);

  if (weekTasks.length === 0 && weekMilestones.length === 0) {
    return null;
  }

  // Find the first task or milestone in the week to get the end date
  const endDate = weekTasks.length > 0
    ? weekTasks[0].dueDate
    : weekMilestones[0].dueDate;

  // Calculate start date (7 days before end date)
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Load study plan tasks from MongoDB API
 * This is now an alias for loadTasksFromApi for backward compatibility
 */
export const loadStudyPlanTasks = async (): Promise<Task[]> => {
  return loadTasksFromApi();
};

/**
 * Load study plan milestones from MongoDB API
 * This is now an alias for loadMilestonesFromApi for backward compatibility
 */
export const loadStudyPlanMilestones = async (): Promise<Milestone[]> => {
  return loadMilestonesFromApi();
};

/**
 * Get tasks for a specific phase
 * Includes tasks that don't have a phase but have a weekNumber that maps to the phase
 */
export const getTasksForPhase = (phase: number, tasks: Task[]): Task[] => {
  return tasks.filter(task => {
    // If task has a phase, use it directly
    if ('phase' in task && typeof task.phase === 'number') {
      return task.phase === phase;
    }

    // If task doesn't have a phase but has a weekNumber, calculate phase from weekNumber
    if ('weekNumber' in task && typeof task.weekNumber === 'number') {
      return getPhaseForWeek(task.weekNumber) === phase;
    }

    // If task has neither phase nor weekNumber, don't include it
    return false;
  });
};

/**
 * Get milestones for a specific phase
 * Includes milestones that don't have a phase but have a weekNumber that maps to the phase
 */
export const getMilestonesForPhase = (phase: number, milestones: Milestone[]): Milestone[] => {
  return milestones.filter(milestone => {
    // If milestone has a phase, use it directly
    if ('phase' in milestone && typeof milestone.phase === 'number') {
      return milestone.phase === phase;
    }

    // If milestone doesn't have a phase but has a weekNumber, calculate phase from weekNumber
    if ('weekNumber' in milestone && typeof milestone.weekNumber === 'number') {
      return getPhaseForWeek(milestone.weekNumber) === phase;
    }

    // If milestone has neither phase nor weekNumber, don't include it
    return false;
  });
};

/**
 * Get all unique phase numbers from tasks and milestones
 * Includes phases calculated from weekNumbers for items without explicit phases
 */
export const getAllPhases = (tasks: Task[], milestones: Milestone[]): number[] => {
  const phases = new Set<number>();

  tasks.forEach(task => {
    if ('phase' in task && typeof task.phase === 'number') {
      phases.add(task.phase);
    } else if ('weekNumber' in task && typeof task.weekNumber === 'number') {
      phases.add(getPhaseForWeek(task.weekNumber));
    }
  });

  milestones.forEach(milestone => {
    if ('phase' in milestone && typeof milestone.phase === 'number') {
      phases.add(milestone.phase);
    } else if ('weekNumber' in milestone && typeof milestone.weekNumber === 'number') {
      phases.add(getPhaseForWeek(milestone.weekNumber));
    }
  });

  return Array.from(phases).sort((a, b) => a - b);
};
