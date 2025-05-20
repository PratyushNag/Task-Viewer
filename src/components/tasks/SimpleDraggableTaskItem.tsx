'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Task } from '@/types';
import DragHandleIcon from '@/components/dnd/DragHandleIcon';
import TouchDragManager from '@/utils/TouchDragManager';

interface SimpleDraggableTaskItemProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onToggleCompletion?: (taskId: string) => void;
}

const SimpleDraggableTaskItem: React.FC<SimpleDraggableTaskItemProps> = ({
  task,
  index,
  onEdit,
  onToggleCompletion
}) => {
  // Create a ref for the drag handle and task item
  const dragHandleRef = useRef<HTMLSpanElement>(null);
  const taskItemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set up touch drag and drop
  useEffect(() => {
    if (typeof window === 'undefined' || !taskItemRef.current || !dragHandleRef.current) return;

    // Get the TouchDragManager instance
    const touchDragManager = TouchDragManager.getInstance();

    // Register the drag handle for touch dragging
    const unregisterDraggable = touchDragManager.registerDraggable(
      dragHandleRef.current,
      {
        dragElement: taskItemRef.current,
        dragId: task.id,
        onDragStart: (dragId) => {
          console.log('Touch drag started for task:', dragId);
          setIsDragging(true);

          // Dispatch a custom event to notify the container
          const dragStartEvent = new CustomEvent('touch-drag-start', {
            bubbles: true,
            detail: { taskId: dragId }
          });
          taskItemRef.current?.dispatchEvent(dragStartEvent);
        },
        onDragEnd: (dragId, x, y, dropTarget) => {
          console.log('Touch drag ended for task:', dragId);
          setIsDragging(false);

          if (dropTarget) {
            // Get the container ID from the drop target
            const containerId = dropTarget.getAttribute('data-droppable-id');

            if (containerId) {
              console.log(`Task ${dragId} dropped on container ${containerId}`);

              // Dispatch a custom event for the drop
              const dropEvent = new CustomEvent('simple-drop', {
                bubbles: true,
                detail: {
                  taskId: dragId,
                  containerId
                }
              });
              dropTarget.dispatchEvent(dropEvent);
            }
          }

          // Dispatch a custom event to notify the container
          const dragEndEvent = new CustomEvent('touch-drag-end', {
            bubbles: true,
            detail: { taskId: dragId }
          });
          taskItemRef.current?.dispatchEvent(dragEndEvent);
        }
      }
    );

    // Clean up on unmount
    return () => {
      unregisterDraggable();
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

  // Handle drag start event
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag start for task:', task.id);

    // Set the data transfer
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';

    // Add a class to indicate dragging
    setIsDragging(true);

    // Create a drag image
    if (taskItemRef.current) {
      const rect = taskItemRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(taskItemRef.current, rect.width / 2, 20);
    }
  };

  // Handle drag end event
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag end for task:', task.id);
    setIsDragging(false);
  };

  // Handle mouse down on drag handle
  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Drag handle mouse down for task:', task.id);

    // Add a class to indicate dragging
    e.currentTarget.classList.add('dragging-active');

    // Find the task item element and make it draggable
    const taskItem = e.currentTarget.closest('.task-item') as HTMLElement;
    if (taskItem) {
      taskItem.draggable = true;
      taskItem.classList.add('being-dragged');
    }
  };

  // Handle mouse up on drag handle
  const handleDragHandleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Drag handle mouse up for task:', task.id);

    // Remove the dragging class
    e.currentTarget.classList.remove('dragging-active');

    // Find the task item element
    const taskItem = e.currentTarget.closest('.task-item') as HTMLElement;
    if (taskItem) {
      taskItem.classList.remove('being-dragged');
    }
  };

  return (
    <div
      ref={taskItemRef}
      className={`p-3 rounded-lg shadow-sm border task-item ${task.completed ? 'border-green-300' : 'border-space-cadet/30'
        } ${isDragging ? 'opacity-50' : ''}`}
      onClick={handleTaskClick}
      style={{
        backgroundColor: '#C2AFF0',
        width: '220px',
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
      data-task-id={task.id}
      data-index={index}
      draggable={false} // Only make draggable when drag handle is clicked
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Drag handle clicked');
                }}
                onMouseDown={handleDragHandleMouseDown}
                onMouseUp={handleDragHandleMouseUp}
                style={{ touchAction: 'none' }}
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
  );
};

export default SimpleDraggableTaskItem;
