// Import jest-dom to extend Jest's expect with DOM-specific matchers
import '@testing-library/jest-dom';

// Mock global objects that might not be available in the test environment
global.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
global.HTMLMediaElement.prototype.pause = jest.fn();

// Mock window methods that are not available in JSDOM
if (typeof window !== 'undefined') {
  // Mock SpeechRecognition if not available
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    class MockSpeechRecognition {
      constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.maxAlternatives = 1;
        this.lang = 'en-US';
      }
      start() {}
      stop() {}
      abort() {}
    }
    
    Object.defineProperty(window, 'SpeechRecognition', {
      value: MockSpeechRecognition,
      writable: true
    });
    
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: MockSpeechRecognition,
      writable: true
    });
  }
  
  // Mock other browser APIs as needed
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = jest.fn();
  }
}

// Suppress React 18 console warnings in test output
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: ReactDOM.render is no longer supported/i.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};
