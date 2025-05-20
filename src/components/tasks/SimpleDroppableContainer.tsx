'use client';

import React, { useRef, useState, useEffect } from 'react';
import TouchDragManager from '@/utils/TouchDragManager';

interface SimpleDroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SimpleDroppableContainer: React.FC<SimpleDroppableContainerProps> = ({
  id,
  children,
  className = '',
  style = {}
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Register with TouchDragManager
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Get the TouchDragManager instance
    const touchDragManager = TouchDragManager.getInstance();

    // Register this container as a drop target
    const unregisterDropTarget = touchDragManager.registerDropTarget(
      containerRef.current,
      id
    );

    // Clean up on unmount
    return () => {
      unregisterDropTarget();
    };
  }, [id]);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the container, not entering a child
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Get the task ID from the data transfer
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      console.log(`Task ${taskId} dropped on container ${id}`);

      // Dispatch a custom event for the drop
      const dropEvent = new CustomEvent('simple-drop', {
        bubbles: true,
        detail: {
          taskId,
          containerId: id
        }
      });
      e.currentTarget.dispatchEvent(dropEvent);
    }
  };

  // Listen for touch-drag-start and touch-drag-end events
  useEffect(() => {
    if (!containerRef.current) return;

    const handleTouchDragStart = () => {
      console.log('Container detected touch drag start');
    };

    const handleTouchDragEnd = () => {
      console.log('Container detected touch drag end');
      setIsDraggingOver(false);
    };

    // Add event listeners
    containerRef.current.addEventListener('touch-drag-start', handleTouchDragStart);
    containerRef.current.addEventListener('touch-drag-end', handleTouchDragEnd);

    // Clean up
    return () => {
      containerRef.current?.removeEventListener('touch-drag-start', handleTouchDragStart);
      containerRef.current?.removeEventListener('touch-drag-end', handleTouchDragEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`simple-droppable ${className} ${isDraggingOver ? 'is-over' : ''}`}
      data-droppable-id={id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: '80px',
        padding: '12px',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        backgroundColor: isDraggingOver ? 'rgba(126, 82, 160, 0.2)' : 'transparent',
        border: isDraggingOver ? '2px dashed #7E52A0' : '2px dashed transparent',
        boxShadow: isDraggingOver ? '0 0 8px rgba(126, 82, 160, 0.3)' : 'none',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default SimpleDroppableContainer;
