/**
 * Utility functions for loading data from JSON files
 */
import { Task, Milestone } from '@/types';
import studyPlanTasksData from '@/data/study_plan_tasks.json';
import studyPlanMilestonesData from '@/data/study_plan_milestones.json';

/**
 * Load tasks from JSON file
 */
export const loadTasksFromJson = (): Task[] => {
  try {
    // Use study plan tasks instead of the regular tasks
    return studyPlanTasksData.map((task: any) => ({
      ...task,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
  } catch (error) {
    console.error('Error loading tasks from JSON:', error);
    return [];
  }
};

/**
 * Load milestones from JSON file
 */
export const loadMilestonesFromJson = (): Milestone[] => {
  try {
    // Use study plan milestones instead of the regular milestones
    return studyPlanMilestonesData.map((milestone: any) => ({
      ...milestone,
      dueDate: milestone.dueDate,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt
    }));
  } catch (error) {
    console.error('Error loading milestones from JSON:', error);
    return [];
  }
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
 * Load study plan tasks from JSON file
 * This is now an alias for loadTasksFromJson for backward compatibility
 */
export const loadStudyPlanTasks = (): Task[] => {
  return loadTasksFromJson();
};

/**
 * Load study plan milestones from JSON file
 * This is now an alias for loadMilestonesFromJson for backward compatibility
 */
export const loadStudyPlanMilestones = (): Milestone[] => {
  return loadMilestonesFromJson();
};

/**
 * Get tasks for a specific phase
 */
export const getTasksForPhase = (phase: number, tasks: Task[]): Task[] => {
  return tasks.filter(task => 'phase' in task && task.phase === phase);
};

/**
 * Get milestones for a specific phase
 */
export const getMilestonesForPhase = (phase: number, milestones: Milestone[]): Milestone[] => {
  return milestones.filter(milestone => 'phase' in milestone && milestone.phase === phase);
};

/**
 * Get all unique phase numbers from tasks and milestones
 */
export const getAllPhases = (tasks: Task[], milestones: Milestone[]): number[] => {
  const phases = new Set<number>();

  tasks.forEach(task => {
    if ('phase' in task && typeof task.phase === 'number') {
      phases.add(task.phase);
    }
  });

  milestones.forEach(milestone => {
    if ('phase' in milestone && typeof milestone.phase === 'number') {
      phases.add(milestone.phase);
    }
  });

  return Array.from(phases).sort((a, b) => a - b);
};
