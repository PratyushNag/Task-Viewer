'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task } from '@/types';
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
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStartDate: string; newDueDate: string; newWeekNumber: number } };

// Define the context type
interface TaskContextType {
  state: TaskState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTask: (taskId: string, newStartDate: string, newDueDate: string, newWeekNumber: number) => void;
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
    default:
      return state;
  }
};

// Provider component
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

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

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const savedTask = await response.json();
      dispatch({ type: 'ADD_TASK', payload: task });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      dispatch({ type: 'UPDATE_TASK', payload: task });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      // Find the task to toggle
      const task = state.tasks.find((t) => t.id === id);

      if (!task) {
        throw new Error('Task not found');
      }

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
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task completion');
      }

      dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: id });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  // Move task to a new date and week
  const moveTask = async (
    taskId: string,
    newStartDate: string,
    newDueDate: string,
    newWeekNumber: number
  ) => {
    try {
      console.log('Moving task:', { taskId, newStartDate, newDueDate, newWeekNumber });

      // Find the task to move
      const task = state.tasks.find((t) => t.id === taskId);

      if (!task) {
        throw new Error('Task not found');
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

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to move task: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API response after moving task:', responseData);

      dispatch({
        type: 'MOVE_TASK',
        payload: { taskId, newStartDate, newDueDate, newWeekNumber },
      });

      // Log the updated state after dispatch
      setTimeout(() => {
        const updatedTask = state.tasks.find((t) => t.id === taskId);
        console.log('Updated task in state after dispatch:', updatedTask);
      }, 0);

      console.log('Task successfully moved in state and database');
    } catch (error) {
      console.error('Error moving task:', error);
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
