'use client';

// This file provides a fallback drag and drop implementation
// for browsers that don't support react-beautiful-dnd

interface DragState {
  dragging: boolean;
  draggedItemId: string | null;
  sourceDroppableId: string | null;
  sourceIndex: number | null;
}

// Global state to track drag operations
const dragState: DragState = {
  dragging: false,
  draggedItemId: null,
  sourceDroppableId: null,
  sourceIndex: null
};

// Event handlers for drag operations
export function initFallbackDnd() {
  if (typeof window === 'undefined') return;

  console.log('Initializing fallback DnD implementation');

  // Add a global mousedown event listener to track drag start
  document.addEventListener('mousedown', function (e) {
    // Check if the target is a drag handle
    const dragHandle = (e.target as HTMLElement).closest('.drag-handle');
    if (!dragHandle) return;

    console.log('Fallback DnD: Drag handle mousedown detected');

    // Find the draggable item - either using react-beautiful-dnd attributes or our custom attributes
    let draggableItem = dragHandle.closest('[data-rbd-draggable-id]');
    let draggableId, droppableId, draggableIndex;

    if (draggableItem) {
      // Using react-beautiful-dnd
      console.log('Fallback DnD: Using react-beautiful-dnd attributes');

      // Find the droppable container
      const droppableContainer = draggableItem.closest('[data-rbd-droppable-id]');
      if (!droppableContainer) return;

      // Get the draggable ID and droppable ID
      draggableId = draggableItem.getAttribute('data-rbd-draggable-id');
      droppableId = droppableContainer.getAttribute('data-rbd-droppable-id');

      // Get the index of the draggable item
      draggableIndex = Array.from(droppableContainer.querySelectorAll('[data-rbd-draggable-id]'))
        .findIndex(item => item === draggableItem);
    } else {
      // Try using our custom attributes
      console.log('Fallback DnD: Using custom attributes');
      draggableItem = dragHandle.closest('.task-item');
      if (!draggableItem) return;

      // Get the task ID from the data attribute
      draggableId = draggableItem.getAttribute('data-task-id');
      draggableIndex = parseInt(draggableItem.getAttribute('data-index') || '0', 10);

      // Find the droppable container
      const droppableContainer = draggableItem.closest('.simple-droppable');
      if (!droppableContainer) return;

      droppableId = droppableContainer.getAttribute('data-droppable-id');
    }

    if (!draggableId || !droppableId || draggableIndex === -1) {
      console.log('Fallback DnD: Missing required attributes', { draggableId, droppableId, draggableIndex });
      return;
    }

    console.log('Fallback DnD: Starting drag operation', { draggableId, droppableId, draggableIndex });

    // Update the drag state
    dragState.dragging = true;
    dragState.draggedItemId = draggableId;
    dragState.sourceDroppableId = droppableId;
    dragState.sourceIndex = draggableIndex;

    console.log('Fallback drag start:', dragState);

    // Add a class to the draggable item
    draggableItem.classList.add('fallback-dragging');

    // Store the initial position
    const initialX = e.clientX;
    const initialY = e.clientY;

    // Create a clone of the draggable item for the drag preview
    const dragPreview = draggableItem.cloneNode(true) as HTMLElement;
    dragPreview.style.position = 'fixed';
    dragPreview.style.top = `${initialY}px`;
    dragPreview.style.left = `${initialX}px`;
    dragPreview.style.width = `${draggableItem.clientWidth}px`;
    dragPreview.style.height = `${draggableItem.clientHeight}px`;
    dragPreview.style.opacity = '0.8';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '9999';
    dragPreview.classList.add('fallback-drag-preview');
    document.body.appendChild(dragPreview);

    // Add a mousemove event listener to track drag movement
    const mousemoveHandler = function (moveEvent: MouseEvent) {
      if (!dragState.dragging) return;

      // Update the position of the drag preview
      dragPreview.style.top = `${moveEvent.clientY}px`;
      dragPreview.style.left = `${moveEvent.clientX}px`;

      // Find the droppable container under the cursor
      const elementsUnderCursor = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY);
      const droppableUnderCursor = elementsUnderCursor.find(el =>
        el.hasAttribute('data-rbd-droppable-id')
      ) as HTMLElement | undefined;

      // Highlight the droppable container
      document.querySelectorAll('[data-rbd-droppable-id]').forEach(el => {
        el.classList.remove('fallback-droppable-active');
      });

      if (droppableUnderCursor) {
        droppableUnderCursor.classList.add('fallback-droppable-active');
      }
    };

    // Add a mouseup event listener to track drag end
    const mouseupHandler = function (upEvent: MouseEvent) {
      if (!dragState.dragging) return;

      // Remove the drag preview
      document.body.removeChild(dragPreview);

      // Remove the dragging class
      draggableItem.classList.remove('fallback-dragging');

      // Find the droppable container under the cursor
      const elementsUnderCursor = document.elementsFromPoint(upEvent.clientX, upEvent.clientY);
      const droppableUnderCursor = elementsUnderCursor.find(el =>
        el.hasAttribute('data-rbd-droppable-id')
      ) as HTMLElement | undefined;

      // Remove highlight from all droppable containers
      document.querySelectorAll('[data-rbd-droppable-id]').forEach(el => {
        el.classList.remove('fallback-droppable-active');
      });

      if (droppableUnderCursor) {
        const destinationDroppableId = droppableUnderCursor.getAttribute('data-rbd-droppable-id');

        // If the destination is different from the source, trigger a drop
        if (destinationDroppableId && destinationDroppableId !== dragState.sourceDroppableId) {
          console.log('Fallback drag end with drop:', {
            draggableId: dragState.draggedItemId,
            source: {
              droppableId: dragState.sourceDroppableId,
              index: dragState.sourceIndex
            },
            destination: {
              droppableId: destinationDroppableId,
              index: 0 // Always append to the end for simplicity
            }
          });

          // Dispatch a custom drop event
          const dropEvent = new CustomEvent('fallback-drop', {
            bubbles: true,
            cancelable: true,
            detail: {
              draggableId: dragState.draggedItemId,
              source: {
                droppableId: dragState.sourceDroppableId,
                index: dragState.sourceIndex
              },
              destination: {
                droppableId: destinationDroppableId,
                index: 0
              }
            }
          });
          document.dispatchEvent(dropEvent);
        } else {
          console.log('Fallback drag cancelled or dropped in same container');
        }
      } else {
        console.log('Fallback drag cancelled (no droppable under cursor)');
      }

      // Reset the drag state
      dragState.dragging = false;
      dragState.draggedItemId = null;
      dragState.sourceDroppableId = null;
      dragState.sourceIndex = null;

      // Remove the event listeners
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
    };

    // Add the event listeners
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  });
}

// Auto-initialize the fallback
if (typeof window !== 'undefined') {
  // Wait for the document to be ready
  if (document.readyState === 'complete') {
    initFallbackDnd();
  } else {
    window.addEventListener('load', initFallbackDnd);
  }
}
