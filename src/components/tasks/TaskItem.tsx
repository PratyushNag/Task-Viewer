'use client';

import React, { useRef } from 'react';
import { Task } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { isTaskOverdue, getTaskBorderClasses, getOverdueTextClasses, getEnhancedTaskBorderClasses, isRolloverTask } from '@/utils/taskUtils';
import { useTaskContext } from '@/context';
import { StrictDraggable } from '@/components/dnd/DragDropWrapper';
import DragHandleIcon from '@/components/dnd/DragHandleIcon';

interface TaskItemProps {
  task: Task;
  index: number; // Position in the list for drag-and-drop
  onEdit?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, onEdit }) => {
  const { toggleTaskCompletion, deleteTask } = useTaskContext();
  const dragHandleRef = useRef<HTMLSpanElement>(null);

  const handleToggle = () => {
    toggleTaskCompletion(task.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const priorityClasses = {
    low: 'bg-lilac/30 text-black',
    medium: 'bg-royal-purple/30 text-black',
    high: 'bg-space-cadet/30 text-black',
  };

  const isOverdue = isTaskOverdue(task);
  const isRollover = isRolloverTask(task);

  return (
    <StrictDraggable
      draggableId={task.id}
      index={index}
      disableInteractiveElementBlocking={true}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-4 mb-3 rounded-lg shadow-sm border task-item ${getEnhancedTaskBorderClasses(task, 'border-space-cadet/30')
            } ${snapshot.isDragging ? 'dragging' : ''}`}
          style={{
            backgroundColor: snapshot.isDragging ? '#7E52A0' : '#C2AFF0',
            color: snapshot.isDragging ? 'white' : 'inherit',
            transition: 'all 0.2s ease',
            boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
            zIndex: snapshot.isDragging ? 9999 : 1,
            cursor: 'pointer',
            ...provided.draggableProps.style
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={handleToggle}
                  className="h-5 w-5 text-royal-purple rounded focus:ring-royal-purple"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-black'
                    }`}>
                    {task.title}
                  </h3>
                  {isRollover && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                      Overdue Reminder
                    </span>
                  )}
                  <span
                    ref={dragHandleRef}
                    className="ml-2 flex items-center justify-center p-1 rounded drag-handle"
                    title="Drag to move"
                    {...provided.dragHandleProps}
                    onClick={(e) => e.stopPropagation()}
                    style={{ touchAction: 'none' }}
                  >
                    <DragHandleIcon className="h-5 w-5" />
                  </span>
                </div>
                {task.description && (
                  <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-black/80'
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
                      <span className="text-xs text-black/70">
                        Start: {formatDate(task.startDate)}
                      </span>
                    )}
                    <span className={`text-xs ${getOverdueTextClasses(task, 'text-black/70')
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
                className="text-black/60 hover:text-royal-purple"
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
                className="text-black/60 hover:text-red-500"
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
      )}
    </StrictDraggable>
  );
};

export default TaskItem;
