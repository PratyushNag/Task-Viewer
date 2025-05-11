'use client';

import React from 'react';
import { Task } from '@/types';
import { formatDate, isPast } from '@/utils/dateUtils';
import { useTaskContext } from '@/context';

interface TaskItemProps {
  task: Task;
  onEdit?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { toggleTaskCompletion, deleteTask } = useTaskContext();

  const handleToggle = () => {
    toggleTaskCompletion(task.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const priorityClasses = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const isOverdue = !task.completed && isPast(task.dueDate);

  return (
    <div className={`p-4 mb-3 bg-white rounded-lg shadow-sm border ${isOverdue ? 'border-red-300' : 'border-gray-200'
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>
          <div>
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {task.description}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[task.priority]
                }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <div className="flex flex-col">
                {task.startDate && (
                  <span className="text-xs text-gray-500">
                    Start: {formatDate(task.startDate)}
                  </span>
                )}
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}>
                  {isOverdue ? 'Overdue: ' : 'Due: '}
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Edit task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
            aria-label="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
