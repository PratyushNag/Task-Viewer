'use client';

// This file provides a polyfill for the Redux store that react-beautiful-dnd expects
// It creates a minimal mock of the Redux store API to prevent errors

export function initDndStorePolyfill() {
  if (typeof window === 'undefined') return;

  // Only run this code on the client side
  if (!window.hasOwnProperty('__REACT_BEAUTIFUL_DND_STORE__')) {
    console.log('Initializing DnD store polyfill for react-beautiful-dnd');
    
    // Create a minimal mock of the Redux store
    const mockStore = {
      getState: () => ({}),
      dispatch: (action: any) => action,
      subscribe: () => () => {},
      replaceReducer: () => {},
    };
    
    // Add the mock store to the window object
    Object.defineProperty(window, '__REACT_BEAUTIFUL_DND_STORE__', {
      value: mockStore,
      writable: false,
      configurable: true,
    });
  }
}

// Auto-initialize the polyfill
initDndStorePolyfill();
