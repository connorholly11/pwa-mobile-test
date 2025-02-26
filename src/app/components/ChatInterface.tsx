'use client';

import { useChat } from '../contexts/ChatContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { useEffect, useRef } from 'react';

export default function ChatInterface() {
  const { messages, clearChat, isLoading, lastTokenUsage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Log message on component mount
  useEffect(() => {
    console.log('ℹ️ ChatInterface mounted - Check the console for API communication logs');
  }, []);

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="ai-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="24" height="24">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 10 15.5a2.5 2.5 0 0 0-2.5-2.5m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"></path>
          </svg>
        </div>
        <h2>DeepSeek AI</h2>
        {messages.length > 0 && (
          <button 
            className="clear-chat-button" 
            onClick={clearChat}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
            </svg>
            Clear
          </button>
        )}
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Say hello to your DeepSeek AI companion!</p>
            <p className="console-hint">Check the browser console (F12) to see API communication logs</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {lastTokenUsage && (
        <div className="token-usage-info">
          <div className="token-item">
            <span className="token-label">Input</span>
            <span className="token-value">{lastTokenUsage.promptTokens} tokens</span>
          </div>
          <div className="token-item">
            <span className="token-label">Output</span>
            <span className="token-value">{lastTokenUsage.completionTokens} tokens</span>
          </div>
          <div className="token-item">
            <span className="token-label">Total</span>
            <span className="token-value">{lastTokenUsage.totalTokens} tokens</span>
          </div>
        </div>
      )}
      
      <ChatInput />
    </div>
  );
} 