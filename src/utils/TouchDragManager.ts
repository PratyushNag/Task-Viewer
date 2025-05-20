'use client';

// A dedicated manager for touch-based drag and drop operations
// This provides a more reliable and visually clear experience on touch devices

interface TouchDragOptions {
  // The element that can be dragged
  dragElement: HTMLElement;
  // The ID of the draggable item (task ID)
  dragId: string;
  // Callback when drag starts
  onDragStart?: (dragId: string, x: number, y: number) => void;
  // Callback when drag moves
  onDragMove?: (dragId: string, x: number, y: number) => void;
  // Callback when drag ends
  onDragEnd?: (dragId: string, x: number, y: number, dropTarget?: HTMLElement) => void;
}

class TouchDragManager {
  private static instance: TouchDragManager;
  private activeDrag: {
    element: HTMLElement;
    dragId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    preview?: HTMLElement;
    options: TouchDragOptions;
  } | null = null;

  private dropTargets: Map<string, HTMLElement> = new Map();
  private currentDropTarget: HTMLElement | null = null;

  // Get the singleton instance
  public static getInstance(): TouchDragManager {
    if (!TouchDragManager.instance) {
      TouchDragManager.instance = new TouchDragManager();
    }
    return TouchDragManager.instance;
  }

  // Private constructor for singleton pattern
  private constructor() {
    // Initialize global touch event listeners
    if (typeof document !== 'undefined') {
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
      console.log('TouchDragManager initialized');
    }
  }

  // Register a draggable element
  public registerDraggable(element: HTMLElement, options: TouchDragOptions): () => void {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      
      // Calculate offset from the touch point to the element's top-left corner
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      
      this.startDrag(options, touch.clientX, touch.clientY, offsetX, offsetY);
    };
    
    // Add touch start event listener to the element
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Return a function to unregister the draggable
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }

  // Register a drop target
  public registerDropTarget(element: HTMLElement, targetId: string): () => void {
    this.dropTargets.set(targetId, element);
    
    // Return a function to unregister the drop target
    return () => {
      this.dropTargets.delete(targetId);
    };
  }

  // Start a drag operation
  private startDrag(options: TouchDragOptions, startX: number, startY: number, offsetX: number, offsetY: number): void {
    // Cancel any existing drag
    if (this.activeDrag) {
      this.endDrag(null);
    }
    
    // Create a preview element
    const preview = this.createDragPreview(options.dragElement);
    
    // Position the preview at the start position
    preview.style.left = `${startX - offsetX}px`;
    preview.style.top = `${startY - offsetY}px`;
    
    // Add the preview to the document
    document.body.appendChild(preview);
    
    // Set the active drag
    this.activeDrag = {
      element: options.dragElement,
      dragId: options.dragId,
      startX,
      startY,
      offsetX,
      offsetY,
      preview,
      options
    };
    
    // Add dragging classes
    options.dragElement.classList.add('touch-dragging');
    
    // Call the drag start callback
    if (options.onDragStart) {
      options.onDragStart(options.dragId, startX, startY);
    }
    
    console.log('Touch drag started:', options.dragId);
  }

  // Handle touch move events
  private handleTouchMove(e: TouchEvent): void {
    if (!this.activeDrag) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    // Update the preview position
    if (this.activeDrag.preview) {
      this.activeDrag.preview.style.left = `${x - this.activeDrag.offsetX}px`;
      this.activeDrag.preview.style.top = `${y - this.activeDrag.offsetY}px`;
    }
    
    // Find the drop target under the touch point
    const dropTarget = this.findDropTargetAt(x, y);
    
    // Update the current drop target
    if (dropTarget !== this.currentDropTarget) {
      if (this.currentDropTarget) {
        this.currentDropTarget.classList.remove('touch-drop-active');
      }
      
      if (dropTarget) {
        dropTarget.classList.add('touch-drop-active');
      }
      
      this.currentDropTarget = dropTarget;
    }
    
    // Call the drag move callback
    if (this.activeDrag.options.onDragMove) {
      this.activeDrag.options.onDragMove(this.activeDrag.dragId, x, y);
    }
  }

  // Handle touch end events
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.activeDrag) return;
    
    e.preventDefault();
    
    // Get the last touch position
    let x = this.activeDrag.startX;
    let y = this.activeDrag.startY;
    
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      x = touch.clientX;
      y = touch.clientY;
    }
    
    // End the drag operation
    this.endDrag(this.currentDropTarget, x, y);
  }

  // End a drag operation
  private endDrag(dropTarget: HTMLElement | null, x?: number, y?: number): void {
    if (!this.activeDrag) return;
    
    // Remove the preview element
    if (this.activeDrag.preview && this.activeDrag.preview.parentNode) {
      this.activeDrag.preview.parentNode.removeChild(this.activeDrag.preview);
    }
    
    // Remove dragging classes
    this.activeDrag.element.classList.remove('touch-dragging');
    
    // Remove drop target highlighting
    if (this.currentDropTarget) {
      this.currentDropTarget.classList.remove('touch-drop-active');
    }
    
    // Call the drag end callback
    if (this.activeDrag.options.onDragEnd) {
      this.activeDrag.options.onDragEnd(
        this.activeDrag.dragId,
        x || this.activeDrag.startX,
        y || this.activeDrag.startY,
        dropTarget
      );
    }
    
    console.log('Touch drag ended:', this.activeDrag.dragId);
    
    // Clear the active drag
    this.activeDrag = null;
    this.currentDropTarget = null;
  }

  // Create a visual preview of the dragged element
  private createDragPreview(element: HTMLElement): HTMLElement {
    // Create a clone of the element
    const preview = element.cloneNode(true) as HTMLElement;
    
    // Style the preview
    preview.style.position = 'fixed';
    preview.style.zIndex = '9999';
    preview.style.pointerEvents = 'none';
    preview.style.opacity = '0.8';
    preview.style.transform = 'scale(1.05)';
    preview.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    preview.style.width = `${element.offsetWidth}px`;
    preview.style.height = `${element.offsetHeight}px`;
    preview.classList.add('touch-drag-preview');
    
    return preview;
  }

  // Find a drop target at the given coordinates
  private findDropTargetAt(x: number, y: number): HTMLElement | null {
    // Get all elements at the point
    const elements = document.elementsFromPoint(x, y);
    
    // Find the first element that is a registered drop target
    for (const element of elements) {
      for (const [targetId, targetElement] of this.dropTargets.entries()) {
        if (targetElement === element || targetElement.contains(element as Node)) {
          return targetElement;
        }
      }
    }
    
    return null;
  }

  // Get the ID of the drop target at the given coordinates
  public getDropTargetIdAt(x: number, y: number): string | null {
    const dropTarget = this.findDropTargetAt(x, y);
    
    if (!dropTarget) return null;
    
    for (const [targetId, targetElement] of this.dropTargets.entries()) {
      if (targetElement === dropTarget) {
        return targetId;
      }
    }
    
    return null;
  }
}

export default TouchDragManager;
