'use client';

// This file provides a custom sensor for react-beautiful-dnd
// to ensure drag events are properly detected

export function initCustomDndSensor() {
  if (typeof window === 'undefined') return;

  console.log('Initializing custom DnD sensor');

  // Add a global mousedown event listener to track drag start
  document.addEventListener('mousedown', function (e) {
    // Check if the target is a drag handle
    const dragHandle = (e.target as HTMLElement).closest('.drag-handle');
    if (!dragHandle) return;

    console.log('Custom DnD Sensor: Mousedown on drag handle detected');

    // Find the draggable item
    const draggableItem = dragHandle.closest('.task-item') || dragHandle.closest('[data-rbd-draggable-id]');
    if (!draggableItem) {
      console.log('Custom DnD Sensor: No draggable item found');
      return;
    }

    // Make the item draggable if it's using our custom implementation
    if (draggableItem.classList.contains('task-item') && !draggableItem.hasAttribute('data-rbd-draggable-id')) {
      draggableItem.setAttribute('draggable', 'true');
      console.log('Custom DnD Sensor: Made item draggable');
    }

    // Store the initial position
    const initialX = e.clientX;
    const initialY = e.clientY;

    // Flag to track if we've started a drag
    let dragStarted = false;

    // Add a mousemove event listener to track drag movement
    const mousemoveHandler = function (moveEvent: MouseEvent) {
      // Calculate the distance moved
      const deltaX = moveEvent.clientX - initialX;
      const deltaY = moveEvent.clientY - initialY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If the distance is greater than a threshold, consider it a drag
      if (distance > 5 && !dragStarted) {
        console.log('Custom DnD Sensor: Drag detected, distance:', distance);
        dragStarted = true;

        // Add dragging classes
        draggableItem.classList.add('being-dragged');
        dragHandle.classList.add('dragging-active');

        // Dispatch a custom drag start event
        const dragStartEvent = new CustomEvent('custom-drag-start', {
          bubbles: true,
          cancelable: true,
          detail: {
            initialX,
            initialY,
            target: dragHandle,
            draggableItem: draggableItem
          }
        });
        dragHandle.dispatchEvent(dragStartEvent);
      }
    };

    // Add a mouseup event listener to track drag end
    const mouseupHandler = function () {
      console.log('Custom DnD Sensor: Mouseup detected, cleaning up');

      // Remove the event listeners
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);

      // Remove dragging classes
      draggableItem.classList.remove('being-dragged');
      dragHandle.classList.remove('dragging-active');

      // Reset draggable attribute if it's our custom implementation
      if (draggableItem.classList.contains('task-item') && !draggableItem.hasAttribute('data-rbd-draggable-id')) {
        draggableItem.setAttribute('draggable', 'false');
      }

      // If a drag was started, dispatch a custom drag end event
      if (dragStarted) {
        console.log('Custom DnD Sensor: Drag ended');
        const dragEndEvent = new CustomEvent('custom-drag-end', {
          bubbles: true,
          cancelable: true,
          detail: {
            target: dragHandle,
            draggableItem: draggableItem
          }
        });
        dragHandle.dispatchEvent(dragEndEvent);
      }
    };

    // Add the event listeners
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  });

  // Add touch event handlers for mobile devices
  document.addEventListener('touchstart', function (e) {
    // Check if the target is a drag handle
    const dragHandle = (e.target as HTMLElement).closest('.drag-handle');
    if (!dragHandle) return;

    console.log('Custom DnD Sensor: Touchstart on drag handle detected');

    // Find the draggable item
    const draggableItem = dragHandle.closest('.task-item') || dragHandle.closest('[data-rbd-draggable-id]');
    if (!draggableItem) {
      console.log('Custom DnD Sensor: No draggable item found');
      return;
    }

    // Prevent default to avoid scrolling
    e.preventDefault();

    // Store the task ID for touch-based drag and drop
    if (draggableItem.classList.contains('task-item')) {
      const taskId = draggableItem.getAttribute('data-task-id');
      if (taskId) {
        draggableItem.setAttribute('data-touch-drag-id', taskId);
      }
    } else if (draggableItem.hasAttribute('data-rbd-draggable-id')) {
      const draggableId = draggableItem.getAttribute('data-rbd-draggable-id');
      if (draggableId) {
        draggableItem.setAttribute('data-touch-drag-id', draggableId);
      }
    }

    // Store the initial position
    const touch = e.touches[0];
    const initialX = touch.clientX;
    const initialY = touch.clientY;

    // Flag to track if we've started a drag
    let dragStarted = false;

    // Create a ghost element for visual feedback
    const ghostElement = document.createElement('div');
    ghostElement.className = 'touch-drag-ghost';
    ghostElement.style.position = 'fixed';
    ghostElement.style.left = `${initialX}px`;
    ghostElement.style.top = `${initialY}px`;
    ghostElement.style.width = '50px';
    ghostElement.style.height = '50px';
    ghostElement.style.backgroundColor = 'rgba(126, 82, 160, 0.5)';
    ghostElement.style.borderRadius = '50%';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.zIndex = '9999';
    ghostElement.style.transform = 'translate(-50%, -50%)';
    ghostElement.style.opacity = '0';
    document.body.appendChild(ghostElement);

    // Add a touchmove event listener to track drag movement
    const touchmoveHandler = function (moveEvent: TouchEvent) {
      // Prevent default to avoid scrolling
      moveEvent.preventDefault();

      // Get the touch position
      const touch = moveEvent.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Calculate the distance moved
      const deltaX = touchX - initialX;
      const deltaY = touchY - initialY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Update the ghost element position
      ghostElement.style.left = `${touchX}px`;
      ghostElement.style.top = `${touchY}px`;

      // If the distance is greater than a threshold, consider it a drag
      if (distance > 10 && !dragStarted) {
        console.log('Custom DnD Sensor: Touch drag detected, distance:', distance);
        dragStarted = true;

        // Show the ghost element
        ghostElement.style.opacity = '1';

        // Add dragging classes
        draggableItem.classList.add('being-dragged');
        dragHandle.classList.add('dragging-active');

        // Dispatch a custom drag start event
        const dragStartEvent = new CustomEvent('custom-drag-start', {
          bubbles: true,
          cancelable: true,
          detail: {
            initialX,
            initialY,
            target: dragHandle,
            draggableItem: draggableItem,
            isTouchEvent: true
          }
        });
        dragHandle.dispatchEvent(dragStartEvent);
      }
    };

    // Add a touchend event listener to track drag end
    const touchendHandler = function () {
      console.log('Custom DnD Sensor: Touchend detected, cleaning up');

      // Remove the ghost element
      if (ghostElement.parentNode) {
        ghostElement.parentNode.removeChild(ghostElement);
      }

      // Remove the event listeners
      document.removeEventListener('touchmove', touchmoveHandler);
      document.removeEventListener('touchend', touchendHandler);
      document.removeEventListener('touchcancel', touchendHandler);

      // Remove dragging classes
      draggableItem.classList.remove('being-dragged');
      dragHandle.classList.remove('dragging-active');

      // If a drag was started, dispatch a custom drag end event
      if (dragStarted) {
        console.log('Custom DnD Sensor: Touch drag ended');
        const dragEndEvent = new CustomEvent('custom-drag-end', {
          bubbles: true,
          cancelable: true,
          detail: {
            target: dragHandle,
            draggableItem: draggableItem,
            isTouchEvent: true
          }
        });
        dragHandle.dispatchEvent(dragEndEvent);
      }
    };

    // Add the event listeners
    document.addEventListener('touchmove', touchmoveHandler, { passive: false });
    document.addEventListener('touchend', touchendHandler);
    document.addEventListener('touchcancel', touchendHandler);
  }, { passive: false });
}

// Auto-initialize the custom sensor
if (typeof window !== 'undefined') {
  // Wait for the document to be ready
  if (document.readyState === 'complete') {
    initCustomDndSensor();
  } else {
    window.addEventListener('load', initCustomDndSensor);
  }
}
