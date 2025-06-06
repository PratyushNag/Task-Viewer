'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task } from '@/types';
import { generateId } from '@/utils/idUtils';
import { useToast } from '@/components/ui/Toast';

// Define the state type
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Define the action types
type TaskAction =
  | { type: 'LOAD_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'LOAD_TASKS_ERROR'; payload: string }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStartDate: string; newDueDate: string; newWeekNumber: number } }
  | { type: 'MOVE_TASK_VISUALLY'; payload: { taskId: string; newVisualWeekNumber: number; newVisualStartDate?: string } };

// Define the context type
interface TaskContextType {
  state: TaskState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTask: (taskId: string, newStartDate: string, newDueDate: string, newWeekNumber: number) => void;
  moveTaskVisually: (taskId: string, newVisualWeekNumber: number, newVisualStartDate?: string) => void;
}

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: true,
  error: null,
};

// Reducer function
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'LOAD_TASKS_SUCCESS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_TASKS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }
    case 'UPDATE_TASK': {
      const updatedTask = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      };
    }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'TOGGLE_TASK_COMPLETION': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
            : task
        ),
      };
    }
    case 'MOVE_TASK': {
      const { taskId, newStartDate, newDueDate, newWeekNumber } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              startDate: newStartDate,
              dueDate: newDueDate,
              weekNumber: newWeekNumber,
              updatedAt: new Date().toISOString(),
            }
            : task
        ),
      };
    }
    case 'MOVE_TASK_VISUALLY': {
      const { taskId, newVisualWeekNumber, newVisualStartDate } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              visualWeekNumber: newVisualWeekNumber,
              visualStartDate: newVisualStartDate,
              updatedAt: new Date().toISOString(),
            }
            : task
        ),
      };
    }
    default:
      return state;
  }
};

// Provider component
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { addToast } = useToast();

  // Load tasks from MongoDB API on initial render
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        dispatch({ type: 'LOAD_TASKS_SUCCESS', payload: data });
      } catch (error) {
        console.error('Error loading tasks:', error);
        dispatch({
          type: 'LOAD_TASKS_ERROR',
          payload: 'Failed to load tasks',
        });
      }
    };

    fetchTasks();
  }, []);

  // Context actions
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // First update the UI for immediate feedback
      dispatch({ type: 'ADD_TASK', payload: task });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      await response.json(); // Get response but we don't need to use it
      addToast('Task added successfully', 'success');
    } catch (error) {
      console.error('Error adding task:', error);
      addToast('Failed to save task to database', 'error');
    }
  };

  const updateTask = async (task: Task) => {
    try {
      // First update the UI for immediate feedback
      dispatch({ type: 'UPDATE_TASK', payload: task });

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          updatedAt: new Date().toISOString(),
        }),
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      addToast('Failed to update task in database', 'error');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // First update the UI for immediate feedback
      dispatch({ type: 'DELETE_TASK', payload: id });

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task from database', 'error');
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      // Find the task to toggle
      const task = state.tasks.find((t) => t.id === id);

      if (!task) {
        throw new Error('Task not found');
      }

      // First update the UI for immediate feedback
      dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: id });

      // Update the task with toggled completion
      const updatedTask = {
        ...task,
        completed: !task.completed,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task completion');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      addToast('Failed to update task completion status in database', 'error');
    }
  };

  // Move task to a new date and week
  const moveTask = async (
    taskId: string,
    newStartDate: string,
    newDueDate: string,
    newWeekNumber: number
  ) => {
    console.log('Moving task:', { taskId, newStartDate, newDueDate, newWeekNumber });

    // Find the task to move
    const task = state.tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error('Task not found:', taskId);
      addToast(`Task not found: ${taskId}`, 'error');
      return;
    }

    console.log('Original task:', task);

    // Update the task with new dates and week number
    const updatedTask = {
      ...task,
      startDate: newStartDate,
      dueDate: newDueDate,
      weekNumber: newWeekNumber,
      updatedAt: new Date().toISOString(),
    };

    console.log('Updated task to be sent to API:', updatedTask);

    // First update the UI state for immediate feedback
    dispatch({
      type: 'MOVE_TASK',
      payload: { taskId, newStartDate, newDueDate, newWeekNumber },
    });

    // Then try to update the database
    const maxRetries = 2;
    let retryCount = 0;
    let success = false;

    while (retryCount <= maxRetries && !success) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
          // Add cache control to prevent caching issues
          cache: 'no-cache',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error response (attempt ${retryCount + 1}/${maxRetries + 1}):`, errorText);
          throw new Error(`Failed to move task: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        console.log('API response after moving task:', responseData);
        success = true;
        console.log('Task successfully moved in state and database');

        // Show success toast only on the first successful attempt
        if (retryCount > 0) {
          addToast('Task moved successfully after retry', 'success');
        }
      } catch (error) {
        console.error(`Error moving task (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        retryCount++;

        if (retryCount <= maxRetries) {
          console.log(`Retrying... (${retryCount}/${maxRetries})`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        } else {
          console.error('All retry attempts failed. Task was updated in UI but not in database.');
          // Show error toast only after all retries have failed
          addToast('Task moved in UI but failed to update in database. Changes may not persist after reload.', 'error');
        }
      }
    }
  };

  // Move task visually without changing actual due dates
  const moveTaskVisually = async (
    taskId: string,
    newVisualWeekNumber: number,
    newVisualStartDate?: string
  ) => {
    console.log('Moving task visually:', { taskId, newVisualWeekNumber, newVisualStartDate });

    // Find the task to move
    const task = state.tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error('Task not found:', taskId);
      addToast(`Task not found: ${taskId}`, 'error');
      return;
    }

    // Update only visual positioning properties
    dispatch({
      type: 'MOVE_TASK_VISUALLY',
      payload: { taskId, newVisualWeekNumber, newVisualStartDate },
    });

    // Update database with visual properties only
    try {
      const updatedTask = {
        ...task,
        visualWeekNumber: newVisualWeekNumber,
        visualStartDate: newVisualStartDate,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to update task visual position');
      }

      console.log('Task visual position updated successfully');
    } catch (error) {
      console.error('Error updating task visual position:', error);
      addToast('Failed to save visual position changes', 'error');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        moveTask,
        moveTaskVisually,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
