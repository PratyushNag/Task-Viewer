'use client';

// This file provides a polyfill for HTML5 Drag and Drop API
// which is required by react-beautiful-dnd to work properly

export function initDndPolyfill() {
  if (typeof window === 'undefined') return;

  // Only run this code on the client side
  if (!window.DragEvent) {
    console.log('Initializing DnD polyfill for react-beautiful-dnd');
    
    // Add missing properties to the window object
    Object.defineProperty(window, 'DragEvent', {
      value: class DragEvent extends Event {
        constructor(type: string, eventInitDict?: EventInit) {
          super(type, eventInitDict);
        }
      }
    });
  }
}

// Auto-initialize the polyfill
initDndPolyfill();
