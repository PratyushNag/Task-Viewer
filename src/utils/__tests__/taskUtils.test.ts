import { isTaskOverdue, getTaskBorderClasses, getOverdueTextClasses, getCalendarEventColor } from '../taskUtils';
import { Task } from '@/types';

// Mock the dateUtils module
jest.mock('../dateUtils', () => ({
  isPast: jest.fn(),
}));

import { isPast } from '../dateUtils';

const mockIsPast = isPast as jest.MockedFunction<typeof isPast>;

describe('taskUtils', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    dueDate: '2025-05-10',
    completed: false,
    priority: 'medium',
    createdAt: '2025-05-01',
    updatedAt: '2025-05-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTaskOverdue', () => {
    it('should return true for incomplete task that is past due', () => {
      mockIsPast.mockReturnValue(true);
      const task = { ...mockTask, completed: false };
      
      expect(isTaskOverdue(task)).toBe(true);
    });

    it('should return false for completed task even if past due', () => {
      mockIsPast.mockReturnValue(true);
      const task = { ...mockTask, completed: true };
      
      expect(isTaskOverdue(task)).toBe(false);
    });

    it('should return false for incomplete task that is not past due', () => {
      mockIsPast.mockReturnValue(false);
      const task = { ...mockTask, completed: false };
      
      expect(isTaskOverdue(task)).toBe(false);
    });
  });

  describe('getTaskBorderClasses', () => {
    it('should return red border classes for overdue task', () => {
      mockIsPast.mockReturnValue(true);
      const task = { ...mockTask, completed: false };
      
      expect(getTaskBorderClasses(task)).toBe('border-red-500 border-2');
    });

    it('should return default border classes for non-overdue task', () => {
      mockIsPast.mockReturnValue(false);
      const task = { ...mockTask, completed: false };
      
      expect(getTaskBorderClasses(task, 'border-gray-300')).toBe('border-gray-300');
    });
  });

  describe('getOverdueTextClasses', () => {
    it('should return red text classes for overdue task', () => {
      mockIsPast.mockReturnValue(true);
      const task = { ...mockTask, completed: false };
      
      expect(getOverdueTextClasses(task)).toBe('text-red-600 font-medium');
    });

    it('should return default text classes for non-overdue task', () => {
      mockIsPast.mockReturnValue(false);
      const task = { ...mockTask, completed: false };
      
      expect(getOverdueTextClasses(task, 'text-gray-500')).toBe('text-gray-500');
    });
  });

  describe('getCalendarEventColor', () => {
    it('should return red color for overdue task', () => {
      mockIsPast.mockReturnValue(true);
      const task = { ...mockTask, completed: false };
      
      expect(getCalendarEventColor(task)).toBe('#EF4444');
    });

    it('should return gray color for completed task', () => {
      mockIsPast.mockReturnValue(false);
      const task = { ...mockTask, completed: true };
      
      expect(getCalendarEventColor(task)).toBe('#9CA3AF');
    });

    it('should return priority-based color for non-overdue, incomplete task', () => {
      mockIsPast.mockReturnValue(false);
      const highPriorityTask = { ...mockTask, completed: false, priority: 'high' as const };
      const mediumPriorityTask = { ...mockTask, completed: false, priority: 'medium' as const };
      const lowPriorityTask = { ...mockTask, completed: false, priority: 'low' as const };
      
      expect(getCalendarEventColor(highPriorityTask)).toBe('#EF4444');
      expect(getCalendarEventColor(mediumPriorityTask)).toBe('#F59E0B');
      expect(getCalendarEventColor(lowPriorityTask)).toBe('#3B82F6');
    });
  });
});
