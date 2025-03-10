import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProvider, useChat } from '../app/contexts/ChatContext';

// Mock the API calls
jest.mock('../app/utils/deepSeekApi', () => ({
  getChatResponse: jest.fn().mockResolvedValue({
    response: 'Mock AI response',
    reasoning: 'Mock reasoning',
  }),
}));

jest.mock('../app/utils/humeApi', () => ({
  createAudioForText: jest.fn().mockResolvedValue('mock-audio-data'),
  createAudioFromBase64: jest.fn().mockReturnValue(new Audio()),
}));

// Test component that uses the ChatContext
const TestComponent = () => {
  const { 
    messages, 
    addMessage, 
    aiPersonality, 
    togglePersonality 
  } = useChat();

  return (
    <div>
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="ai-personality">{aiPersonality}</div>
      <button 
        data-testid="add-message-btn" 
        onClick={() => addMessage('Test message', 'user')}
      >
        Add Message
      </button>
      <button 
        data-testid="toggle-personality-btn" 
        onClick={togglePersonality}
      >
        Toggle Personality
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should add a message and increment messages count', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Initial count should be 0 or just the welcome message
    const initialCount = screen.getByTestId('messages-count').textContent;
    
    // Add a message
    fireEvent.click(screen.getByTestId('add-message-btn'));
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Messages count should be incremented 
    const newCount = screen.getByTestId('messages-count').textContent;
    expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
  });

  test('should toggle AI personality', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Get initial personality
    const initialPersonality = screen.getByTestId('ai-personality').textContent;
    
    // Toggle personality
    fireEvent.click(screen.getByTestId('toggle-personality-btn'));
    
    // Personality should be toggled
    const newPersonality = screen.getByTestId('ai-personality').textContent;
    expect(newPersonality).not.toBe(initialPersonality);
    
    // Toggle back
    fireEvent.click(screen.getByTestId('toggle-personality-btn'));
    
    // Should be back to initial personality
    const finalPersonality = screen.getByTestId('ai-personality').textContent;
    expect(finalPersonality).toBe(initialPersonality);
  });
});
