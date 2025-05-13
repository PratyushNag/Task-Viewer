'use client';

import { useState, useEffect } from 'react';
import { DropResult } from 'react-beautiful-dnd';

export interface DragAndDropState {
  isDragging: boolean;
  draggingId: string | null;
  sourceIndex: number | null;
  sourceDroppableId: string | null;
}

export function useDragAndDrop(onDragEndCallback: (result: DropResult) => void) {
  const [state, setState] = useState<DragAndDropState>({
    isDragging: false,
    draggingId: null,
    sourceIndex: null,
    sourceDroppableId: null,
  });

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setState({
        isDragging: false,
        draggingId: null,
        sourceIndex: null,
        sourceDroppableId: null,
      });
    };
  }, []);

  const onDragStart = (start: any) => {
    setState({
      isDragging: true,
      draggingId: start.draggableId,
      sourceIndex: start.source.index,
      sourceDroppableId: start.source.droppableId,
    });
  };

  const onDragEnd = (result: DropResult) => {
    setState({
      isDragging: false,
      draggingId: null,
      sourceIndex: null,
      sourceDroppableId: null,
    });

    // Call the callback provided by the parent component
    onDragEndCallback(result);
  };

  return {
    state,
    handlers: {
      onDragStart,
      onDragEnd,
    },
  };
}
