/**
 * Storage utility functions for the Calendar View application
 */
import { Task, Milestone } from '@/types';

// Current data version for future compatibility
const DATA_VERSION = '1.0';

// Storage keys
export const STORAGE_KEYS = {
  TASKS: 'calendar_view_tasks',
  MILESTONES: 'calendar_view_milestones',
  VERSION: 'calendar_view_data_version',
};

/**
 * Save tasks to localStorage
 */
export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

/**
 * Load tasks from localStorage
 */
export const loadTasks = (): Task[] => {
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

/**
 * Save milestones to localStorage
 */
export const saveMilestones = (milestones: Milestone[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  } catch (error) {
    console.error('Error saving milestones to localStorage:', error);
  }
};

/**
 * Load milestones from localStorage
 */
export const loadMilestones = (): Milestone[] => {
  try {
    const milestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    return milestones ? JSON.parse(milestones) : [];
  } catch (error) {
    console.error('Error loading milestones from localStorage:', error);
    return [];
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.MILESTONES);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
};
