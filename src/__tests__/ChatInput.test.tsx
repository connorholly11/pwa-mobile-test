import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from '../app/components/ChatInput';
import { ChatProvider } from '../app/contexts/ChatContext';

// Mock speech recognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock the window SpeechRecognition object
Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true
});

// Mock the ChatContext
jest.mock('../app/contexts/ChatContext', () => {
  const originalModule = jest.requireActual('../app/contexts/ChatContext');
  return {
    ...originalModule,
    useChat: () => ({
      addMessage: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
    }),
  };
});

describe('ChatInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field and buttons', () => {
    render(
      <ChatProvider>
        <ChatInput />
      </ChatProvider>
    );

    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start listening/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Send button
  });

  test('allows typing in the input field', () => {
    render(
      <ChatProvider>
        <ChatInput />
      </ChatProvider>
    );

    const inputField = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    
    expect(inputField).toHaveValue('Hello, world!');
  });

  test('toggles listening state when mic button is clicked', () => {
    render(
      <ChatProvider>
        <ChatInput />
      </ChatProvider>
    );

    const micButton = screen.getByRole('button', { name: /Start listening/i });
    
    // Click to start listening
    fireEvent.click(micButton);
    
    // Should call start on the speech recognition API
    expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1);
    
    // Click to stop listening (need to re-get the button as it may have updated)
    const updatedMicButton = screen.getByRole('button', { name: /Stop listening/i });
    fireEvent.click(updatedMicButton);
    
    // Should call stop on the speech recognition API
    expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1);
  });

  test('handles form submission correctly', async () => {
    const addMessageMock = jest.fn().mockResolvedValue(undefined);
    
    jest.mock('../app/contexts/ChatContext', () => ({
      useChat: () => ({
        addMessage: addMessageMock,
        isLoading: false,
      }),
    }));

    render(
      <ChatProvider>
        <ChatInput />
      </ChatProvider>
    );

    const inputField = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(inputField, { target: { value: 'Test message' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Wait for any promises to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Input should be cleared after submission
    expect(inputField).toHaveValue('');
  });
});
