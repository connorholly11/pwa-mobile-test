import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPanel from '../app/components/AdminPanel';
import { useChat } from '../app/contexts/ChatContext';
import { useUINotifications } from '../app/contexts/UINotificationContext';

// Mock dependencies
jest.mock('../app/contexts/ChatContext', () => ({
  useChat: jest.fn(),
}));

jest.mock('../app/contexts/UINotificationContext', () => ({
  useUINotifications: jest.fn(),
}));

describe('AdminPanel', () => {
  const mockMessages = [
    {
      id: '1',
      text: 'Hello',
      sender: 'user',
      timestamp: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      text: 'Hi there! I\'m Mark Manson AI. How can I help you today?',
      sender: 'ai',
      timestamp: '2023-01-01T00:00:05.000Z',
      tokenUsage: {
        promptTokens: 10,
        completionTokens: 15,
        totalCost: 0.000025,
      },
    },
  ];

  const mockClearChat = jest.fn();
  const mockAddNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (useChat as jest.Mock).mockReturnValue({
      messages: mockMessages,
      clearChat: mockClearChat,
      lastTokenUsage: {
        promptTokens: 10,
        completionTokens: 15,
        totalCost: 0.000025,
      },
      aiPersonality: 'friendly',
    });
    
    (useUINotifications as jest.Mock).mockReturnValue({
      addNotification: mockAddNotification,
    });

    // Mock Date.now to return a consistent value
    jest.spyOn(Date, 'now').mockImplementation(() => 1672531200000); // 2023-01-01
    
    // Mock the URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mocked-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders admin panel with correct sections', () => {
    render(<AdminPanel />);
    
    // Check for main sections
    expect(screen.getByText('Mark Manson AI - Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Session Information')).toBeInTheDocument();
    expect(screen.getByText('Message Statistics')).toBeInTheDocument();
    expect(screen.getByText('Token Usage')).toBeInTheDocument();
    expect(screen.getByText('Cost Analysis')).toBeInTheDocument();
    expect(screen.getByText('Recent Messages')).toBeInTheDocument();
  });

  test('displays correct message statistics', () => {
    render(<AdminPanel />);
    
    // Check for message counts
    expect(screen.getByText('Total Messages')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total messages
    expect(screen.getByText('User Messages')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // User messages
    expect(screen.getByText('AI Responses')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // AI messages
  });

  test('displays token usage correctly', () => {
    render(<AdminPanel />);
    
    // Check for token counts
    expect(screen.getByText('Input Tokens')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Prompt tokens
    expect(screen.getByText('Output Tokens')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Completion tokens
    expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // Total tokens
  });

  test('clear chat button calls clearChat', () => {
    render(<AdminPanel />);
    
    const clearButton = screen.getByText('Clear Data');
    fireEvent.click(clearButton);
    
    expect(mockClearChat).toHaveBeenCalled();
  });

  test('export button triggers data export', () => {
    // Mock document.createElement
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement(tag);
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    render(<AdminPanel />);
    
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);
    
    // Verify export functionality
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAddNotification).toHaveBeenCalledWith(
      'Chat data exported successfully',
      'success'
    );
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  test('shows empty state when no messages', () => {
    (useChat as jest.Mock).mockReturnValue({
      messages: [],
      clearChat: mockClearChat,
      lastTokenUsage: null,
      aiPersonality: 'friendly',
    });
    
    render(<AdminPanel />);
    
    expect(screen.getByText('No messages in current session')).toBeInTheDocument();
    
    // Export and clear buttons should be disabled
    const exportButton = screen.getByText('Export Data').closest('button');
    const clearButton = screen.getByText('Clear Data').closest('button');
    
    expect(exportButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });
});
