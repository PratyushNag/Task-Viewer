'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Milestone } from '@/types';
import { generateId } from '@/utils/idUtils';
import { getDeadlineColor } from '@/utils/dateUtils';

// Define the state type
interface MilestoneState {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
}

// Define the action types
type MilestoneAction =
  | { type: 'LOAD_MILESTONES_SUCCESS'; payload: Milestone[] }
  | { type: 'LOAD_MILESTONES_ERROR'; payload: string }
  | { type: 'ADD_MILESTONE'; payload: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt' | 'color'> }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; payload: string }
  | { type: 'TOGGLE_MILESTONE_COMPLETION'; payload: string };

// Define the context type
interface MilestoneContextType {
  state: MilestoneState;
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt' | 'color'>) => void;
  updateMilestone: (milestone: Milestone) => void;
  deleteMilestone: (id: string) => void;
  toggleMilestoneCompletion: (id: string) => void;
}

// Create the context
const MilestoneContext = createContext<MilestoneContextType | undefined>(undefined);

// Initial state
const initialState: MilestoneState = {
  milestones: [],
  loading: true,
  error: null,
};

// Reducer function
const milestoneReducer = (state: MilestoneState, action: MilestoneAction): MilestoneState => {
  switch (action.type) {
    case 'LOAD_MILESTONES_SUCCESS':
      return {
        ...state,
        milestones: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_MILESTONES_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_MILESTONE': {
      const newMilestone: Milestone = {
        ...action.payload,
        id: generateId(),
        color: getDeadlineColor(action.payload.dueDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        milestones: [...state.milestones, newMilestone],
      };
    }
    case 'UPDATE_MILESTONE': {
      const updatedMilestone = {
        ...action.payload,
        color: getDeadlineColor(action.payload.dueDate),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        milestones: state.milestones.map((milestone) =>
          milestone.id === updatedMilestone.id ? updatedMilestone : milestone
        ),
      };
    }
    case 'DELETE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.filter((milestone) => milestone.id !== action.payload),
      };
    case 'TOGGLE_MILESTONE_COMPLETION': {
      return {
        ...state,
        milestones: state.milestones.map((milestone) =>
          milestone.id === action.payload
            ? {
              ...milestone,
              completed: !milestone.completed,
              updatedAt: new Date().toISOString(),
            }
            : milestone
        ),
      };
    }
    default:
      return state;
  }
};

// Provider component
export const MilestoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(milestoneReducer, initialState);

  // Load milestones from MongoDB API on initial render
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/milestones');

        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }

        const data = await response.json();
        dispatch({ type: 'LOAD_MILESTONES_SUCCESS', payload: data });
      } catch (error) {
        console.error('Error loading milestones:', error);
        dispatch({
          type: 'LOAD_MILESTONES_ERROR',
          payload: 'Failed to load milestones',
        });
      }
    };

    fetchMilestones();
  }, []);

  // Context actions
  const addMilestone = async (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt' | 'color'>) => {
    try {
      const newMilestone = {
        ...milestone,
        id: generateId(),
        color: getDeadlineColor(milestone.dueDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMilestone),
      });

      if (!response.ok) {
        throw new Error('Failed to add milestone');
      }

      const savedMilestone = await response.json();
      dispatch({ type: 'ADD_MILESTONE', payload: milestone });
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const updateMilestone = async (milestone: Milestone) => {
    try {
      const updatedMilestone = {
        ...milestone,
        color: getDeadlineColor(milestone.dueDate),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMilestone),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      dispatch({ type: 'UPDATE_MILESTONE', payload: milestone });
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const response = await fetch(`/api/milestones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }

      dispatch({ type: 'DELETE_MILESTONE', payload: id });
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const toggleMilestoneCompletion = async (id: string) => {
    try {
      // Find the milestone to toggle
      const milestone = state.milestones.find((m) => m.id === id);

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Update the milestone with toggled completion
      const updatedMilestone = {
        ...milestone,
        completed: !milestone.completed,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/milestones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMilestone),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle milestone completion');
      }

      dispatch({ type: 'TOGGLE_MILESTONE_COMPLETION', payload: id });
    } catch (error) {
      console.error('Error toggling milestone completion:', error);
    }
  };

  return (
    <MilestoneContext.Provider
      value={{
        state,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        toggleMilestoneCompletion,
      }}
    >
      {children}
    </MilestoneContext.Provider>
  );
};

// Custom hook to use the milestone context
export const useMilestoneContext = (): MilestoneContextType => {
  const context = useContext(MilestoneContext);
  if (context === undefined) {
    throw new Error('useMilestoneContext must be used within a MilestoneProvider');
  }
  return context;
};
