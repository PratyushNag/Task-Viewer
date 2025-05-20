'use client';

import React, { ReactNode } from 'react';
import { TaskProvider } from './TaskContext';
import { MilestoneProvider } from './MilestoneContext';
import { ToastProvider } from '@/components/ui/Toast';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      <TaskProvider>
        <MilestoneProvider>{children}</MilestoneProvider>
      </TaskProvider>
    </ToastProvider>
  );
};

export * from './TaskContext';
export * from './MilestoneContext';
