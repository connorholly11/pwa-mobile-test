'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getChatResponse, ApiResponse } from '../utils/deepSeekApi';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
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
    totalTokens: number;
  } | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial system message to set the AI's behavior
const SYSTEM_MESSAGE = "You are a friendly and helpful AI assistant. Keep your responses concise and engaging. You're chatting in a mobile app interface.";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'discover'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTokenUsage, setLastTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null>(null);
  
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
          tokenUsage: apiResponse.usage,
        };
        
        console.log('📨 Adding AI message to conversation');
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('❌ Error getting AI response:', error);
        // Add a fallback error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "Sorry, I'm having trouble connecting. Please try again later.",
          sender: 'ai',
          timestamp: new Date().toISOString(),
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
        lastTokenUsage
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