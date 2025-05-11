import { saveTasks, loadTasks, saveMilestones, loadMilestones, isStorageAvailable, clearAllData, STORAGE_KEYS } from '../storageUtils';
import { Task, Milestone } from '@/types';

describe('storageUtils', () => {
  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveTasks', () => {
    it('should save tasks to localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          dueDate: '2023-05-15',
          completed: false,
          priority: 'medium',
          createdAt: '2023-05-10',
          updatedAt: '2023-05-10',
        },
      ];

      saveTasks(tasks);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TASKS,
        JSON.stringify(tasks)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.VERSION,
        '1.0'
      );
    });

    it('should handle errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          dueDate: '2023-05-15',
          completed: false,
          priority: 'medium',
          createdAt: '2023-05-10',
          updatedAt: '2023-05-10',
        },
      ];

      saveTasks(tasks);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving tasks to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          dueDate: '2023-05-15',
          completed: false,
          priority: 'medium',
          createdAt: '2023-05-10',
          updatedAt: '2023-05-10',
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(tasks));

      const result = loadTasks();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TASKS);
      expect(result).toEqual(tasks);
    });

    it('should return an empty array if no tasks are found', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = loadTasks();

      expect(result).toEqual([]);
    });

    it('should handle errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = loadTasks();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading tasks from localStorage:',
        expect.any(Error)
      );
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('saveMilestones', () => {
    it('should save milestones to localStorage', () => {
      const milestones: Milestone[] = [
        {
          id: '1',
          title: 'Test Milestone',
          dueDate: '2023-05-15',
          completed: false,
          createdAt: '2023-05-10',
          updatedAt: '2023-05-10',
        },
      ];

      saveMilestones(milestones);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MILESTONES,
        JSON.stringify(milestones)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.VERSION,
        '1.0'
      );
    });
  });

  describe('loadMilestones', () => {
    it('should load milestones from localStorage', () => {
      const milestones: Milestone[] = [
        {
          id: '1',
          title: 'Test Milestone',
          dueDate: '2023-05-15',
          completed: false,
          createdAt: '2023-05-10',
          updatedAt: '2023-05-10',
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(milestones));

      const result = loadMilestones();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.MILESTONES);
      expect(result).toEqual(milestones);
    });

    it('should return an empty array if no milestones are found', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = loadMilestones();

      expect(result).toEqual([]);
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true if localStorage is available', () => {
      const result = isStorageAvailable();
      expect(result).toBe(true);
    });

    it('should return false if localStorage throws an error', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = isStorageAvailable();
      expect(result).toBe(false);
    });
  });

  describe('clearAllData', () => {
    it('should remove all application data from localStorage', () => {
      clearAllData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.TASKS);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MILESTONES);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.VERSION);
    });

    it('should handle errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      clearAllData();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing data from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
