'use client';

import React, { useEffect, useRef } from 'react';
import { Task } from '@/types';
import { StrictDraggable } from '@/components/dnd/DragDropWrapper';
import DragHandleIcon from '@/components/dnd/DragHandleIcon';

interface DraggableTaskItemWithHandleProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onToggleCompletion?: (taskId: string) => void;
}

const DraggableTaskItemWithHandle: React.FC<DraggableTaskItemWithHandleProps> = ({
  task,
  index,
  onEdit,
  onToggleCompletion
}) => {
  // Create a ref for the drag handle
  const dragHandleRef = useRef<HTMLSpanElement>(null);

  // Add event listeners for our custom drag events
  useEffect(() => {
    const handleCustomDragStart = (e: any) => {
      console.log('Custom drag start detected on task:', task.id);
    };

    const handleCustomDragEnd = (e: any) => {
      console.log('Custom drag end detected on task:', task.id);
    };

    const dragHandle = dragHandleRef.current;
    if (dragHandle) {
      dragHandle.addEventListener('custom-drag-start', handleCustomDragStart);
      dragHandle.addEventListener('custom-drag-end', handleCustomDragEnd);
    }

    return () => {
      if (dragHandle) {
        dragHandle.removeEventListener('custom-drag-start', handleCustomDragStart);
        dragHandle.removeEventListener('custom-drag-end', handleCustomDragEnd);
      }
    };
  }, [task.id]);
  const handleTaskClick = (e: React.MouseEvent) => {
    // Prevent click from propagating if it's on the checkbox or drag handle
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('.drag-handle') || e.target.closest('input[type="checkbox"]'))
    ) {
      return;
    }

    // Otherwise, open the edit form
    onEdit(task);
  };

  const handleCheckboxChange = () => {
    if (onToggleCompletion) {
      onToggleCompletion(task.id);
    }
  };

  return (
    <StrictDraggable
      draggableId={task.id}
      index={index}
      disableInteractiveElementBlocking={true}
    >
      {(provided, snapshot) => {
        console.log(`Rendering draggable for task ${task.id}, isDragging: ${snapshot.isDragging}`);
        return (
          <div
            ref={provided.innerRef}
            // Only apply draggableProps, NOT dragHandleProps here
            {...provided.draggableProps}
            className={`p-3 rounded-lg shadow-sm border task-item ${task.completed ? 'border-green-300' : 'border-space-cadet/30'
              } ${snapshot.isDragging ? 'dragging' : ''}`}
            onClick={handleTaskClick}
            style={{
              backgroundColor: snapshot.isDragging ? '#7E52A0' : '#C2AFF0',
              color: snapshot.isDragging ? 'white' : 'inherit',
              width: '220px',
              transition: 'all 0.2s ease',
              boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
              zIndex: snapshot.isDragging ? 9999 : 1,
              cursor: 'pointer',
              ...provided.draggableProps.style
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                {onToggleCompletion && (
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 mt-1 text-royal-purple rounded focus:ring-royal-purple"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <div>
                  <div className="flex items-center">
                    <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-space-cadet'
                      }`}>
                      {task.title}
                    </h3>
                    <span
                      ref={dragHandleRef}
                      className="ml-2 flex items-center justify-center p-1 rounded drag-handle"
                      title="Drag to move"
                      {...provided.dragHandleProps}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Drag handle clicked');
                      }}
                      onMouseDown={(e) => {
                        console.log('Drag handle mouse down');
                        // Add a class to indicate dragging
                        e.currentTarget.classList.add('dragging-active');
                      }}
                      onMouseUp={(e) => {
                        console.log('Drag handle mouse up');
                        // Remove the dragging class
                        e.currentTarget.classList.remove('dragging-active');
                      }}
                    >
                      <DragHandleIcon className="h-5 w-5" />
                    </span>
                  </div>
                  {task.priority && (
                    <div className="mt-1 flex items-center space-x-1">
                      <span className="text-xs text-space-cadet/70">
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </StrictDraggable>
  );
};

export default DraggableTaskItemWithHandle;
