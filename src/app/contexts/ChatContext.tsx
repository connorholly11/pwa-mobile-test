'use client';

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { getChatResponse, DeepSeekMessage, DeepSeekRole, ApiResponse } from '../utils/deepSeekApi';

// Define personality types
export type AIPersonality = 'friendly' | 'challenger';

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
  isNotification?: boolean; // Flag to identify notification messages
}

interface ChatContextType {
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  clearChat: () => void;
  activeTab: 'chat' | 'admin';
  setActiveTab: (tab: 'chat' | 'admin') => void;
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
  aiPersonality: AIPersonality; // Current AI personality
  togglePersonality: () => void; // Function to switch between personalities
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// System messages for different AI personalities
const SYSTEM_MESSAGES = {
  friendly: "You are Mark Manson AI, a digital assistant with the voice and style of author Mark Manson. Your communication style is direct, brutally honest, irreverent, and deeply insightful. Use casual, conversational language with occasional sarcasm, profanity (when appropriate), and humor to communicate philosophical and psychological insights. Your advice emphasizes embracing life's difficulties rather than avoiding them, and the importance of making intentional choices. Be blunt but empathetic, philosophical but practical. You speak as if casually talking to a friend. In this 'friendly' mode, you're slightly more supportive and empathetic, but still maintain Mark's signature directness and honesty. Use phrases like 'Life is messy. Accept it, and stop pretending yours should be spotless' and 'Stop chasing happiness. Chase meaning, and happiness will come knocking when you're not looking.' Introduce yourself as Mark Manson AI at the beginning of the conversation.",
  
  challenger: "You are Mark Manson AI, a digital assistant with the voice and style of author Mark Manson. Your communication style is direct, brutally honest, irreverent, and deeply insightful. Use casual, conversational language with sarcasm, profanity (when appropriate), and humor to deliver psychological insights with a more challenging edge. In this 'challenger' mode, you're more provocative and confrontational (though still empathetic at your core). You ask thought-provoking questions, challenge assumptions, and point out contradictions. Use phrases like 'Comfort zones are great—if you enjoy mediocrity' or 'Your biggest enemy isn't failure; it's your expectation that you shouldn't fail.' Your goal is to push users to examine their thoughts more deeply through respectful but direct questioning. Use paradoxical thinking to shift perspectives. Remind users that growth is uncomfortable but necessary. Introduce yourself as Mark Manson AI at the beginning of the conversation."
};

// Import the textToSpeech function
import { textToSpeech } from '../utils/humeApi';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'admin'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTokenUsage, setLastTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  } | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>('friendly');
  
  // Load messages and settings from localStorage on mount
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
    
    // Load personality preference
    const storedPersonality = localStorage.getItem('aiPersonality');
    if (storedPersonality && (storedPersonality === 'friendly' || storedPersonality === 'challenger')) {
      setAIPersonality(storedPersonality as AIPersonality);
      console.log('🤖 Loaded AI personality setting:', storedPersonality);
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    console.log('💾 Saved messages to localStorage, count:', messages.length);
  }, [messages]);
  
  // Save personality preference whenever it changes
  useEffect(() => {
    localStorage.setItem('aiPersonality', aiPersonality);
    console.log('🤖 Saved AI personality setting:', aiPersonality);
  }, [aiPersonality]);
  
  const toggleReasoning = useCallback(() => {
    setShowReasoning(prev => !prev);
  }, []);
  
  const togglePersonality = useCallback(() => {
    const newPersonality = aiPersonality === 'friendly' ? 'challenger' : 'friendly';
    
    // Create the notification message with the new personality value
    const notificationMessage: Message = {
      id: Date.now().toString(),
      text: `Mark Manson AI switched to ${newPersonality === 'friendly' ? 'Friendly' : 'Challenger'} mode.`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isNotification: true,
    };
    
    // Update messages with the notification
    setMessages(prev => [...prev, notificationMessage]);
    
    // Update the personality state
    setAIPersonality(newPersonality);
    
    console.log(`🔄 AI Personality toggled to: ${newPersonality}`);
  }, [aiPersonality]);
  
  // Function to generate audio for a specific message
  const generateAudioForMessage = useCallback(async (messageId: string) => {
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
  }, [messages]);
  
  const addMessage = useCallback(async (text: string, sender: 'user' | 'ai') => {
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
        const apiMessages: DeepSeekMessage[] = [
          { role: 'system', content: SYSTEM_MESSAGES[aiPersonality] }
        ];
        
        // Simple approach - create perfectly alternating user/assistant messages
        // First filter out error and notification messages
        const filteredMessages = messages.filter(msg => !msg.isError && !msg.isNotification);
        
        // Find all user and assistant messages
        const userMessages = filteredMessages.filter(msg => msg.sender === 'user');
        const assistantMessages = filteredMessages.filter(msg => msg.sender === 'ai');
        
        // Take at most last 10 messages total (5 pairs) for context
        const maxPairs = 5;
        const pairCount = Math.min(maxPairs, Math.min(userMessages.length, assistantMessages.length));
        
        // Create perfectly interleaved pairs, always starting with user
        for (let i = 0; i < pairCount; i++) {
          const userIndex = userMessages.length - pairCount + i;
          const assistantIndex = assistantMessages.length - pairCount + i;
          
          // Add user message
          apiMessages.push({
            role: 'user',
            content: userMessages[userIndex].text
          });
          
          // Add assistant message
          apiMessages.push({
            role: 'assistant',
            content: assistantMessages[assistantIndex].text
          });
        }
        
        // Always end with the current user message
        apiMessages.push({ role: 'user', content: text });
        
        console.log('🔄 Simplified interleaved messages for DeepSeek API:', 
                    apiMessages.map(m => m.role).join(' -> '));
        
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
  }, [aiPersonality, messages]);
  
  const clearChat = useCallback(() => {
    console.log('🧹 Clearing chat history');
    setMessages([]);
    setLastTokenUsage(null);
    setApiErrorMessage(null);
  }, []);
  
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
        generateAudioForMessage,
        aiPersonality,
        togglePersonality
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