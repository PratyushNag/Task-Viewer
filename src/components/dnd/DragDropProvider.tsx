'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import '@/utils/dndPolyfill';
import '@/utils/dndStorePolyfill';
import '@/utils/customDndSensor';
import '@/utils/fallbackDnd';

// Create a context to share the DragDropContext state
export const DndContext = React.createContext<boolean>(false);

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd?: (result: any) => void;
  onDragStart?: (start: any) => void;
  onDragUpdate?: (update: any) => void;
}

// Helper to ensure we only render on the client side
const useDndSafeRender = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if document is ready
      if (document.readyState === 'complete') {
        // Add a small delay to ensure all DOM APIs are fully available
        setTimeout(() => {
          setIsClient(true);
          console.log('DnD Provider enabled - document already complete');
        }, 50);
      } else {
        // Wait for document to be ready
        const handleReady = () => {
          // Add a small delay after load event
          setTimeout(() => {
            setIsClient(true);
            console.log('DnD Provider enabled - after load event');
          }, 50);
        };
        window.addEventListener('load', handleReady);
        return () => window.removeEventListener('load', handleReady);
      }
    }
  }, []);

  return isClient;
};

// Provider component to ensure DragDropContext is available
const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onDragEnd = () => { },
  onDragStart = () => { },
  onDragUpdate = () => { }
}) => {
  const isClient = useDndSafeRender();

  // Set up a unique ID for this context
  const [contextId] = useState(() => `dnd-context-${Math.random().toString(36).substring(2, 9)}`);

  // Handle drag events with detailed logging - use useCallback to prevent unnecessary re-renders
  const handleDragStart = useCallback((start: any) => {
    try {
      console.log('DragDropProvider: handleDragStart', start);
      onDragStart(start);
    } catch (error) {
      console.error('Error in onDragStart handler:', error);
    }
  }, [onDragStart]);

  const handleDragUpdate = useCallback((update: any) => {
    try {
      console.log('DragDropProvider: handleDragUpdate', update);
      onDragUpdate(update);
    } catch (error) {
      console.error('Error in onDragUpdate handler:', error);
    }
  }, [onDragUpdate]);

  const handleDragEnd = useCallback((result: any) => {
    try {
      console.log('DragDropProvider: handleDragEnd', result);
      // Log detailed information about the drag operation
      if (result.destination) {
        console.log('Drag successful:', {
          from: result.source.droppableId,
          to: result.destination.droppableId,
          itemId: result.draggableId
        });
      } else {
        console.log('Drag cancelled or no valid destination');
      }

      // Call the original handler
      onDragEnd(result);

      // Force cleanup after a short delay to ensure react-beautiful-dnd has finished
      setTimeout(() => {
        console.log('🧹 DragDropProvider: Triggering cleanup after drag end');
        // Import and call cleanup function
        import('@/utils/dragCleanup').then(({ cleanupAllDragStates }) => {
          cleanupAllDragStates();
        });
      }, 100);

    } catch (error) {
      console.error('Error in onDragEnd handler:', error);
    }
  }, [onDragEnd]);

  // Add a useEffect to log when the provider is mounted - ALWAYS call this hook
  useEffect(() => {
    if (!isClient) {
      return; // Don't set up event listeners if not on client
    }

    console.log('DragDropProvider mounted with context ID:', contextId);

    // Listen for fallback drop events
    const handleFallbackDrop = (e: any) => {
      console.log('Fallback drop event detected:', e.detail);
      handleDragEnd(e.detail);
    };

    document.addEventListener('fallback-drop', handleFallbackDrop);

    // Add a cleanup function to log when the provider is unmounted
    return () => {
      console.log('DragDropProvider unmounted');
      document.removeEventListener('fallback-drop', handleFallbackDrop);
    };
  }, [contextId, isClient, handleDragEnd]);

  // Early return AFTER all hooks have been called
  if (!isClient) {
    // Return a placeholder with the same structure to avoid layout shifts
    return <div>{children}</div>;
  }

  return (
    <DndContext.Provider value={true}>
      <div className="drag-drop-provider" data-testid="drag-drop-provider">
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          enableDefaultSensors={true}
        >
          <div data-rbd-context-id={contextId} style={{ height: '100%', width: '100%' }}>
            {children}
          </div>
        </DragDropContext>
      </div>
    </DndContext.Provider>
  );
};

export default DragDropProvider;
