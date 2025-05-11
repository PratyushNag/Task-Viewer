'use client';

import React, { ReactNode } from 'react';
import { TaskProvider } from './TaskContext';
import { MilestoneProvider } from './MilestoneContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <TaskProvider>
      <MilestoneProvider>{children}</MilestoneProvider>
    </TaskProvider>
  );
};

export * from './TaskContext';
export * from './MilestoneContext';
