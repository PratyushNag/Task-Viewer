export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate?: Date | string;
  dueDate: Date | string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date | string;
  updatedAt: Date | string;
  weekNumber?: number;
  category?: string;
  phase?: number;
  primaryFocus?: string;
  // Visual positioning properties (separate from actual due dates)
  visualWeekNumber?: number;
  visualStartDate?: Date | string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  startDate?: Date | string;
  dueDate: Date | string;
  completed: boolean;
  color?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  weekNumber?: number;
  phase?: number;
}
