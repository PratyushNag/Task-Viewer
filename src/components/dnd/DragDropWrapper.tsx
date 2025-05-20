'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import '@/utils/dndPolyfill';
import '@/utils/dndStorePolyfill';

// Import the DndContext from our provider
import { DndContext } from './DragDropProvider';

// Provider component to ensure DragDropContext is available
export const DndProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClient = useDndSafeRender();

  return (
    <DndContext.Provider value={isClient}>
      {children}
    </DndContext.Provider>
  );
};

// Helper to ensure we only render on the client side
const useDndSafeRender = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use a small delay to ensure React has fully initialized the DOM
    // and the HTML5 Drag and Drop API is available
    if (typeof window !== 'undefined') {
      // Check if document is ready
      if (document.readyState === 'complete') {
        // Add a small delay to ensure all DOM APIs are fully available
        setTimeout(() => {
          setIsClient(true);
          console.log('DnD rendering enabled - document already complete');
        }, 50);
      } else {
        // Wait for document to be ready
        const handleReady = () => {
          // Add a small delay after load event
          setTimeout(() => {
            setIsClient(true);
            console.log('DnD rendering enabled - after load event');
          }, 50);
        };
        window.addEventListener('load', handleReady);
        return () => window.removeEventListener('load', handleReady);
      }
    }
  }, []);

  return isClient;
};

// Wrapper for DragDropContext to handle React 19 compatibility
// This is now deprecated - use DragDropProvider instead
export const StrictDragDropContext: React.FC<{
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
  onDragStart?: (start: any) => void;
  onDragUpdate?: (update: any) => void;
}> = ({ onDragEnd, onDragStart, onDragUpdate, children }) => {
  console.warn('StrictDragDropContext is deprecated. Use DragDropProvider instead.');

  const isClient = useDndSafeRender();

  if (!isClient) {
    // Return a placeholder with the same structure to avoid layout shifts
    return <div>{children}</div>;
  }

  return (
    <div>
      {children}
    </div>
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
    // Use the context value instead of a separate hook
    const isClient = React.useContext(DndContext);

    if (!isClient) {
      // Return a placeholder with similar structure
      return <div className="droppable-placeholder">{children({
        innerRef: () => { },
        droppableProps: {},
        placeholder: null
      }, { isDraggingOver: false, draggingOverWith: null })}</div>;
    }

    // Wrap in a try-catch to handle potential errors
    try {
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
    } catch (error) {
      console.error('Error rendering Droppable:', error);
      // Fallback to a placeholder if there's an error
      return <div className="droppable-error">{children({
        innerRef: () => { },
        droppableProps: {},
        placeholder: null
      }, { isDraggingOver: false, draggingOverWith: null })}</div>;
    }
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
    // Use the context value instead of a separate hook
    const isClient = React.useContext(DndContext);

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

    // Wrap in a try-catch to handle potential errors
    try {
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
    } catch (error) {
      console.error('Error rendering Draggable:', error);
      // Fallback to a placeholder if there's an error
      return <div className="draggable-error">{children({
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
  };

export { type DropResult } from 'react-beautiful-dnd';
