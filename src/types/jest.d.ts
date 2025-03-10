import '@testing-library/jest-dom';

// Global types for Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
      // Add more custom matchers as needed
    }
  }
}
