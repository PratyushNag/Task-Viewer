'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import '@/utils/dndPolyfill';

// Helper to ensure we only render on the client side
const useDndSafeRender = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use a small delay to ensure React 19 has fully initialized the DOM
    // and the HTML5 Drag and Drop API is available
    if (typeof window !== 'undefined') {
      // Check if document is ready
      if (document.readyState === 'complete') {
        setIsClient(true);
      } else {
        // Wait for document to be ready
        const handleReady = () => {
          setIsClient(true);
        };
        window.addEventListener('load', handleReady);
        return () => window.removeEventListener('load', handleReady);
      }
    }
  }, []);

  return isClient;
};

// Wrapper for DragDropContext to handle React 19 compatibility
export const StrictDragDropContext: React.FC<{
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
  onDragStart?: (start: any) => void;
  onDragUpdate?: (update: any) => void;
}> = ({ onDragEnd, onDragStart, onDragUpdate, children }) => {
  const isClient = useDndSafeRender();

  if (!isClient) {
    // Return a placeholder with the same structure to avoid layout shifts
    return <div>{children}</div>;
  }

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
    >
      {children}
    </DragDropContext>
  );
};

// Wrapper for Droppable to handle React 19 compatibility
export const StrictDroppable: React.FC<{
  droppableId: string;
  direction?: 'horizontal' | 'vertical';
  type?: string;
  mode?: 'standard' | 'virtual';
  isDropDisabled?: boolean;
  isCombineEnabled?: boolean;
  ignoreContainerClipping?: boolean;
  renderClone?: any;
  getContainerForClone?: () => HTMLElement;
  children: (provided: any, snapshot: any) => React.ReactNode;
}> = ({
  droppableId,
  direction = 'vertical',
  type = 'DEFAULT',
  mode = 'standard',
  isDropDisabled = false,
  isCombineEnabled = false,
  ignoreContainerClipping = false,
  renderClone,
  getContainerForClone,
  children
}) => {
    const isClient = useDndSafeRender();

    if (!isClient) {
      // Return a placeholder with similar structure
      return <div className="droppable-placeholder">{children({
        innerRef: () => { },
        droppableProps: {},
        placeholder: null
      }, { isDraggingOver: false, draggingOverWith: null })}</div>;
    }

    return (
      <Droppable
        droppableId={droppableId}
        direction={direction}
        type={type}
        mode={mode}
        isDropDisabled={isDropDisabled}
        isCombineEnabled={isCombineEnabled}
        ignoreContainerClipping={ignoreContainerClipping}
        renderClone={renderClone}
        getContainerForClone={getContainerForClone}
      >
        {children}
      </Droppable>
    );
  };

// Wrapper for Draggable to handle React 19 compatibility
export const StrictDraggable: React.FC<{
  draggableId: string;
  index: number;
  isDragDisabled?: boolean;
  disableInteractiveElementBlocking?: boolean;
  shouldRespectForcePress?: boolean;
  children: (provided: any, snapshot: any) => React.ReactNode;
}> = ({
  draggableId,
  index,
  isDragDisabled = false,
  disableInteractiveElementBlocking = false,
  shouldRespectForcePress = true,
  children
}) => {
    const isClient = useDndSafeRender();

    if (!isClient) {
      // Return a placeholder with similar structure
      return <div className="draggable-placeholder">{children({
        innerRef: () => { },
        draggableProps: {},
        dragHandleProps: null,
      }, {
        isDragging: false,
        isDropAnimating: false,
        isClone: false,
        dropAnimation: null,
        draggingOver: null,
        combineWith: null,
        combineTargetFor: null,
        mode: null
      })}</div>;
    }

    return (
      <Draggable
        draggableId={draggableId}
        index={index}
        isDragDisabled={isDragDisabled}
        disableInteractiveElementBlocking={disableInteractiveElementBlocking}
        shouldRespectForcePress={shouldRespectForcePress}
      >
        {children}
      </Draggable>
    );
  };

export { type DropResult } from 'react-beautiful-dnd';
