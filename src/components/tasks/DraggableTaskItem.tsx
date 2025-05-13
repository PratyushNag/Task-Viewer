'use client';

import React from 'react';
import { Task } from '@/types';
import { formatDate, isPast } from '@/utils/dateUtils';
import { StrictDraggable } from '@/components/dnd/DragDropWrapper';

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onEdit: () => void;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({ task, index, onEdit }) => {
  const priorityClasses = {
    low: 'bg-lilac/30 text-space-cadet',
    medium: 'bg-royal-purple/30 text-space-cadet',
    high: 'bg-space-cadet/30 text-space-cadet',
  };

  const isOverdue = !task.completed && isPast(task.dueDate);

  console.log(`Rendering DraggableTaskItem for task ${task.id} with index ${index}`);

  return (
    <StrictDraggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        console.log(`Draggable render function for task ${task.id}, isDragging: ${snapshot.isDragging}`);
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`p-4 mb-3 rounded-lg shadow-sm border ${isOverdue ? 'border-red-300' : 'border-space-cadet/30'
              } ${snapshot.isDragging ? 'opacity-75 shadow-lg bg-royal-purple/20' : ''}`}
            style={{
              backgroundColor: '#C2AFF0',
              ...provided.draggableProps.style
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div>
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-space-cadet'
                    }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-space-cadet/80'
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
                        <span className="text-xs text-space-cadet/70">
                          Start: {formatDate(task.startDate)}
                        </span>
                      )}
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-space-cadet/70'
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
                  className="text-space-cadet/60 hover:text-royal-purple"
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
              </div>
            </div>
          </div>
        );
      }}
    </StrictDraggable>
  );
};

export default DraggableTaskItem;
