'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getChatResponse, ApiResponse } from '../utils/deepSeekApi';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  reasoning?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  };
  isError?: boolean; // Flag to identify error messages
  audioData?: string; // Base64 encoded audio data
  isAudioLoading?: boolean; // Flag to indicate audio is being generated
  audioError?: string; // Error message if audio generation fails
}

interface ChatContextType {
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  clearChat: () => void;
  activeTab: 'chat' | 'discover';
  setActiveTab: (tab: 'chat' | 'discover') => void;
  isLoading: boolean;
  lastTokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  } | null;
  showReasoning: boolean;
  toggleReasoning: () => void;
  apiErrorMessage: string | null; // Track the current API error
  generateAudioForMessage: (messageId: string) => Promise<void>; // New function to generate audio
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial system message to set the AI's behavior
const SYSTEM_MESSAGE = "You are a wise old man, but don't disguise yourself as a human. you are calm, but direct. You want to help people explore humankind and themselves. Speak wisely, but noramlly. You aren't trying to sound special.";

// Import the textToSpeech function
import { textToSpeech } from '../utils/humeApi';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'discover'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTokenUsage, setLastTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  } | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  
  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        console.log('📋 Loaded messages from localStorage:', parsedMessages.length);
      } catch (e) {
        console.error('❌ Failed to parse messages from localStorage', e);
      }
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    console.log('💾 Saved messages to localStorage, count:', messages.length);
  }, [messages]);
  
  const toggleReasoning = () => {
    setShowReasoning(prev => !prev);
  };
  
  // Function to generate audio for a specific message
  const generateAudioForMessage = async (messageId: string) => {
    // Find the message
    const message = messages.find(m => m.id === messageId);
    if (!message || message.audioData || message.isAudioLoading) {
      return; // Already has audio or is loading
    }
    
    // Update the message to indicate audio is loading
    setMessages(prevMessages => 
      prevMessages.map(m => 
        m.id === messageId ? { ...m, isAudioLoading: true } : m
      )
    );
    
    try {
      // Call the Hume API to convert text to speech
      const audioData = await textToSpeech(message.text);
      
      // Update the message with the audio data
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { ...m, audioData, isAudioLoading: false } : m
        )
      );
      
      console.log('🎵 Added audio data to message:', messageId);
    } catch (error) {
      // Handle error
      console.error('❌ Error generating audio for message:', error);
      
      // Update message with error
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId ? { 
            ...m, 
            isAudioLoading: false, 
            audioError: error instanceof Error ? error.message : 'Unknown error generating audio' 
          } : m
        )
      );
    }
  };
  
  const addMessage = async (text: string, sender: 'user' | 'ai') => {
    console.log(`📝 Adding ${sender} message: "${text}"`);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // If this is a user message, get response from DeepSeek API
    if (sender === 'user') {
      setIsLoading(true);
      setApiErrorMessage(null); // Clear any previous errors
      console.log('⏳ Setting loading state to true');
      
      try {
        // Convert our messages to the format DeepSeek API expects
        // Use proper typing for roles to match DeepSeekMessage
        const apiMessages = [
          { role: 'system' as const, content: SYSTEM_MESSAGE },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text
          })),
          { role: 'user' as const, content: text }
        ];
        
        console.log('🔄 Converted messages for API:', apiMessages.length);
        
        // Get response from API
        const apiResponse: ApiResponse = await getChatResponse(apiMessages);
        console.log('✅ Received AI response from API');
        
        if (apiResponse.usage) {
          console.log('📊 Token usage:', apiResponse.usage);
          setLastTokenUsage(apiResponse.usage);
        }
        
        // Add AI response
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: apiResponse.content,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          reasoning: apiResponse.reasoning,
          tokenUsage: apiResponse.usage,
        };
        
        console.log('📨 Adding AI message to conversation');
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('❌ Error getting AI response:', error);
        
        // Set the API error message for display in the UI
        if (error instanceof Error) {
          setApiErrorMessage(error.message);
        } else {
          setApiErrorMessage('Unknown error occurred');
        }
        
        // Add a error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: error instanceof Error ? error.message : 'An error occurred when connecting to the AI service.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isError: true
        };
        console.log('⚠️ Adding error message to conversation');
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
        console.log('⏳ Setting loading state to false');
      }
    }
  };
  
  const clearChat = () => {
    console.log('🧹 Clearing chat history');
    setMessages([]);
    setLastTokenUsage(null);
    setApiErrorMessage(null);
  };
  
  return (
    <ChatContext.Provider
      value={{ 
        messages, 
        addMessage, 
        clearChat, 
        activeTab, 
        setActiveTab,
        isLoading,
        lastTokenUsage,
        showReasoning,
        toggleReasoning,
        apiErrorMessage,
        generateAudioForMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 