'use client';

// This file provides a polyfill for HTML5 Drag and Drop API
// which is required by react-beautiful-dnd to work properly

export function initDndPolyfill() {
  if (typeof window === 'undefined') return;

  console.log('Initializing DnD polyfill for react-beautiful-dnd');

  // Only run this code on the client side
  if (!window.DragEvent) {
    console.log('Adding DragEvent polyfill');

    // Add missing properties to the window object
    Object.defineProperty(window, 'DragEvent', {
      value: class DragEvent extends Event {
        constructor(type: string, eventInitDict?: EventInit) {
          super(type, eventInitDict);
        }
      }
    });
  }

  // Ensure dataTransfer is available
  if (typeof window.DataTransfer === 'undefined') {
    console.log('Adding DataTransfer polyfill');
    window.DataTransfer = function () {
      this.data = {};
      this.setData = function (format, data) {
        this.data[format] = data;
      };
      this.getData = function (format) {
        return this.data[format];
      };
      this.effectAllowed = 'all';
      this.dropEffect = 'none';
      this.files = [];
      this.types = [];
    } as any;
  }

  // Add missing event properties
  const originalEventConstructor = window.Event;
  if (originalEventConstructor && !('dataTransfer' in new DragEvent('drag'))) {
    console.log('Enhancing DragEvent with dataTransfer property');
    Object.defineProperty(window.DragEvent.prototype, 'dataTransfer', {
      get: function () {
        if (!this._dataTransfer) {
          this._dataTransfer = new DataTransfer();
        }
        return this._dataTransfer;
      },
      configurable: true
    });
  }

  // Ensure the document has the necessary drag and drop event listeners
  if (typeof document !== 'undefined') {
    console.log('Adding global drag and drop event listeners');

    // Prevent default behavior for drag events to allow our custom handling
    document.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    });

    document.addEventListener('drop', function (e) {
      e.preventDefault();
    });
  }
}

// Auto-initialize the polyfill
initDndPolyfill();
