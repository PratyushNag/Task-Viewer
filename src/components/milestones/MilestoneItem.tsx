'use client';

import React from 'react';
import { Milestone } from '@/types';
import { formatDate, isPast, getDeadlineColor } from '@/utils/dateUtils';
import { useMilestoneContext } from '@/context';

interface MilestoneItemProps {
  milestone: Milestone;
  onEdit?: () => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, onEdit }) => {
  const { toggleMilestoneCompletion, deleteMilestone } = useMilestoneContext();

  const handleToggle = () => {
    toggleMilestoneCompletion(milestone.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone(milestone.id);
    }
  };

  const isOverdue = !milestone.completed && isPast(milestone.dueDate);
  const colorClass = milestone.completed
    ? 'bg-gray-100 text-gray-800'
    : getDeadlineColor(milestone.dueDate);

  return (
    <div className={`border rounded-lg mb-4 overflow-hidden ${isOverdue ? 'border-red-500 border-2' : 'border-gray-200'}`}>
      <div className="flex items-start">
        <div className="p-4 flex-grow">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={milestone.completed}
              onChange={handleToggle}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
            />
            <div>
              <h3 className={`text-lg font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {milestone.title}
              </h3>
              {milestone.description && (
                <p className="text-gray-600 mt-1">{milestone.description}</p>
              )}
              <div className="mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">Week {milestone.weekNumber}</span>
                  <span>Due: {formatDate(milestone.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="flex flex-col items-center justify-center px-4 border-l border-gray-200">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-600 p-2"
              aria-label="Edit milestone"
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
          </div>

          <div className="flex flex-col items-center justify-center px-4 border-l border-gray-200">
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 p-2"
              aria-label="Delete milestone"
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

      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${milestone.completed
            ? 'bg-gray-100 text-gray-800'
            : isOverdue
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
            }`}>
            {milestone.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Due'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MilestoneItem;
