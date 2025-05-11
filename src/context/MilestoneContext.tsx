'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Milestone } from '@/types';
import { isStorageAvailable, clearAllData } from '@/utils/storageUtils';
import { loadMilestonesFromJson } from '@/utils/dataLoader';
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

  // Load milestones from JSON on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear localStorage to ensure we always load from JSON
        if (isStorageAvailable()) {
          clearAllData();
        }

        // Load from JSON
        const jsonMilestones = loadMilestonesFromJson();
        dispatch({ type: 'LOAD_MILESTONES_SUCCESS', payload: jsonMilestones });
      } catch (error) {
        dispatch({
          type: 'LOAD_MILESTONES_ERROR',
          payload: 'Failed to load milestones',
        });
      }
    } else {
      dispatch({
        type: 'LOAD_MILESTONES_ERROR',
        payload: 'Window is not available',
      });
    }
  }, []);

  // Disable saving to localStorage to ensure we always use the JSON data
  // This is commented out to prevent localStorage from overriding the JSON data
  /*
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      isStorageAvailable() &&
      !state.loading
    ) {
      saveMilestones(state.milestones);
    }
  }, [state.milestones, state.loading]);
  */

  // Context actions
  const addMilestone = (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt' | 'color'>) => {
    dispatch({ type: 'ADD_MILESTONE', payload: milestone });
  };

  const updateMilestone = (milestone: Milestone) => {
    dispatch({ type: 'UPDATE_MILESTONE', payload: milestone });
  };

  const deleteMilestone = (id: string) => {
    dispatch({ type: 'DELETE_MILESTONE', payload: id });
  };

  const toggleMilestoneCompletion = (id: string) => {
    dispatch({ type: 'TOGGLE_MILESTONE_COMPLETION', payload: id });
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
