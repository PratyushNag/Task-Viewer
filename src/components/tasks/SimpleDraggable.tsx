'use client';

import React, { useRef, useState } from 'react';

interface SimpleDraggableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SimpleDraggable: React.FC<SimpleDraggableProps> = ({
  id,
  children,
  className = '',
  style = {}
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleDragStart = (e: React.DragEvent) => {
    // Set the data transfer
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to indicate dragging
    setIsDragging(true);
    
    // If there's an image, set it as the drag image
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, rect.height / 2);
    }
    
    console.log(`Drag started for item ${id}`);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.log(`Drag ended for item ${id}`);
  };

  return (
    <div
      ref={dragRef}
      className={`simple-draggable ${className} ${isDragging ? 'is-dragging' : ''}`}
      draggable={true}
      data-draggable-id={id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.7 : 1,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default SimpleDraggable;
