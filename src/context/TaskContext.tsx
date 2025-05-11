'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task } from '@/types';
import { loadTasks, saveTasks, isStorageAvailable } from '@/utils/storageUtils';
import { loadTasksFromJson } from '@/utils/dataLoader';
import { generateId } from '@/utils/idUtils';

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
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string };

// Define the context type
interface TaskContextType {
  state: TaskState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
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
    default:
      return state;
  }
};

// Provider component
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from localStorage or JSON on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // First try to load from localStorage if available
        if (isStorageAvailable()) {
          const storedTasks = loadTasks();
          if (storedTasks && storedTasks.length > 0) {
            dispatch({ type: 'LOAD_TASKS_SUCCESS', payload: storedTasks });
            return;
          }
        }

        // If no tasks in localStorage or localStorage not available, load from JSON
        const jsonTasks = loadTasksFromJson();
        dispatch({ type: 'LOAD_TASKS_SUCCESS', payload: jsonTasks });
      } catch (error) {
        dispatch({
          type: 'LOAD_TASKS_ERROR',
          payload: 'Failed to load tasks',
        });
      }
    } else {
      dispatch({
        type: 'LOAD_TASKS_ERROR',
        payload: 'Window is not available',
      });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      isStorageAvailable() &&
      !state.loading
    ) {
      saveTasks(state.tasks);
    }
  }, [state.tasks, state.loading]);

  // Context actions
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTaskCompletion = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: id });
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
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
