'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { getTasksForWeek, getDateRangeForWeek } from '@/utils/dataLoader';

interface WeeklyTaskListProps {
  tasks: Task[];
  weekNumber: number;
  title?: string;
  emptyMessage?: string;
}

const WeeklyTaskList: React.FC<WeeklyTaskListProps> = ({
  tasks,
  weekNumber,
  title,
  emptyMessage = 'No tasks found for this week',
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const weekTasks = getTasksForWeek(weekNumber, tasks);
  const dateRange = getDateRangeForWeek(weekNumber, tasks, []);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  // Group tasks by category
  const tasksByCategory: Record<string, Task[]> = {};
  weekTasks.forEach(task => {
    const category = task.category || 'Other';
    if (!tasksByCategory[category]) {
      tasksByCategory[category] = [];
    }
    tasksByCategory[category].push(task);
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {title || `Week ${weekNumber}`}
          </h2>
          {dateRange && (
            <p className="text-sm text-gray-500">
              {dateRange.start} to {dateRange.end}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Task
        </button>
      </div>

      {weekTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                {category}
              </h3>
              <div className="space-y-4">
                {categoryTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={() => handleEdit(task)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default WeeklyTaskList;
