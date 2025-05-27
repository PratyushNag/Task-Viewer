'use client';

/**
 * Utility functions to clean up drag and drop states
 * Helps prevent lingering drag shadows and visual artifacts
 */

// List of all drag-related classes that should be cleaned up
const DRAG_CLASSES = [
  'dragging',
  'being-dragged',
  'touch-dragging',
  'dragging-active',
  'is-dragging',
  'fallback-dragging',
  'touch-drag-preview'
];

// List of all droppable-related classes that should be cleaned up
const DROPPABLE_CLASSES = [
  'is-over',
  'touch-drop-active',
  'fallback-droppable-active'
];

/**
 * Force cleanup of a specific element's drag state
 */
export function cleanupElementDragState(element: HTMLElement): void {
  if (!element) {
    console.warn('cleanupElementDragState: element is null or undefined');
    return;
  }

  console.log('Cleaning up drag state for element:', element);

  // Remove all drag-related classes
  DRAG_CLASSES.forEach(className => {
    if (element.classList.contains(className)) {
      console.log(`Removing class: ${className}`);
      element.classList.remove(className);
    }
  });

  // Reset draggable attribute
  element.draggable = false;

  // Reset inline styles that might have been applied during drag
  const stylesToReset = [
    'transform',
    'opacity',
    'z-index',
    'zIndex',
    'background-color',
    'backgroundColor',
    'color',
    'box-shadow',
    'boxShadow',
    'cursor',
    'position',
    'top',
    'left',
    'right',
    'bottom'
  ];

  stylesToReset.forEach(style => {
    if (element.style.getPropertyValue(style)) {
      console.log(`Removing style: ${style} = ${element.style.getPropertyValue(style)}`);
      element.style.removeProperty(style);
    }
  });

  // Force reset all inline styles if they exist
  if (element.style.cssText) {
    console.log('Clearing all inline styles:', element.style.cssText);
    element.style.cssText = '';
  }

  // Add cleanup class temporarily to force reset styles
  element.classList.add('drag-cleanup');

  // Remove cleanup class after a short delay to allow CSS to apply
  setTimeout(() => {
    element.classList.remove('drag-cleanup');
    console.log('Cleanup completed for element:', element);
  }, 100);
}

/**
 * Force cleanup of all drag states in the document
 */
export function cleanupAllDragStates(): void {
  console.log('🧹 Starting global drag cleanup...');

  // Find all elements with drag-related classes
  const allDragClasses = [...DRAG_CLASSES, ...DROPPABLE_CLASSES];
  let cleanedCount = 0;

  allDragClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements with class: ${className}`);
    }
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        cleanupElementDragState(element);
        cleanedCount++;
      }
    });
  });

  // Also cleanup any droppable containers
  const droppableContainers = document.querySelectorAll('.simple-droppable, .droppable-container');
  droppableContainers.forEach(container => {
    if (container instanceof HTMLElement) {
      DROPPABLE_CLASSES.forEach(className => {
        if (container.classList.contains(className)) {
          console.log(`Removing droppable class: ${className} from container`);
          container.classList.remove(className);
        }
      });
    }
  });

  // Remove any lingering drag preview elements
  const dragPreviews = document.querySelectorAll('.touch-drag-preview, [data-rbd-drag-handle-draggable-id]');
  dragPreviews.forEach(preview => {
    if (preview instanceof HTMLElement) {
      console.log('Removing drag preview element:', preview);
      if (preview.style.position === 'fixed' || preview.style.position === 'absolute') {
        preview.remove();
      }
    }
  });

  // Reset any elements that might have been transformed or moved
  const transformedElements = document.querySelectorAll('[style*="transform"], [style*="position"], [style*="z-index"]');
  transformedElements.forEach(element => {
    if (element instanceof HTMLElement && (element.classList.contains('task-item') || element.closest('.task-item'))) {
      console.log('Cleaning transformed element:', element);
      cleanupElementDragState(element);
    }
  });

  // Special cleanup for react-beautiful-dnd elements
  const rdbElements = document.querySelectorAll('[data-rbd-draggable-id], [data-rbd-droppable-id]');
  rdbElements.forEach(element => {
    if (element instanceof HTMLElement && element.style.transform) {
      console.log('Cleaning react-beautiful-dnd element:', element);
      element.style.transform = '';
      element.style.transition = '';
    }
  });

  console.log(`🧹 Global drag cleanup completed. Cleaned ${cleanedCount} elements.`);
}

/**
 * Setup global cleanup listeners for common drag end scenarios
 */
export function setupGlobalDragCleanup(): void {
  // Cleanup on mouse up anywhere in the document
  document.addEventListener('mouseup', () => {
    setTimeout(cleanupAllDragStates, 100);
  });

  // Cleanup on touch end anywhere in the document
  document.addEventListener('touchend', () => {
    setTimeout(cleanupAllDragStates, 100);
  });

  // Cleanup on drag end events
  document.addEventListener('dragend', () => {
    setTimeout(cleanupAllDragStates, 100);
  });

  // Cleanup when focus is lost (e.g., user clicks outside)
  document.addEventListener('blur', () => {
    setTimeout(cleanupAllDragStates, 200);
  });

  // Cleanup on escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cleanupAllDragStates();
    }
  });

  console.log('Global drag cleanup listeners setup');
}

/**
 * Cleanup function specifically for task items
 */
export function cleanupTaskItemDragState(taskId: string): void {
  const taskElements = document.querySelectorAll(`[data-task-id="${taskId}"]`);
  taskElements.forEach(element => {
    if (element instanceof HTMLElement) {
      cleanupElementDragState(element);
    }
  });
}
