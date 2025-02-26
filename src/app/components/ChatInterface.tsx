'use client';

import { useChat } from '../contexts/ChatContext';
import { isFallbackModeActive, getCurrentModel } from '../utils/deepSeekApi';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { useEffect, useRef, useState } from 'react';

export default function ChatInterface() {
  const { messages, clearChat, isLoading, lastTokenUsage, showReasoning, toggleReasoning, apiErrorMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiConnectionIssue, setApiConnectionIssue] = useState(false);
  const [currentModelName, setCurrentModelName] = useState(getCurrentModel());

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Log message on component mount
  useEffect(() => {
    console.log('ℹ️ ChatInterface mounted - Check the console for API communication logs');
  }, []);
  
  // Check API connection status periodically and update current model
  useEffect(() => {
    const checkApiStatus = () => {
      setApiConnectionIssue(isFallbackModeActive());
      setCurrentModelName(getCurrentModel());
    };
    
    // Check immediately
    checkApiStatus();
    
    // Then check after each message is received or every few seconds
    const checkInterval = setInterval(checkApiStatus, 3000);
    
    return () => clearInterval(checkInterval);
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="ai-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="24" height="24">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 10 15.5a2.5 2.5 0 0 0-2.5-2.5zm9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"></path>
          </svg>
        </div>
        <div className="header-title">
          <h2>DeepSeek AI</h2>
          <div className="model-info">
            Using model: <span className="model-name">{currentModelName}</span>
          </div>
          {apiConnectionIssue && (
            <div className="api-status-indicator error">
              <span className="status-dot"></span>
              API Connection Error
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            className={`reasoning-toggle-button ${showReasoning ? 'active' : ''}`}
            onClick={toggleReasoning}
            title={showReasoning ? "Hide AI reasoning" : "Show AI reasoning"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z"/>
            </svg>
            <span>Reasoning</span>
          </button>
          
          {messages.length > 0 && (
            <button 
              className="clear-chat-button" 
              onClick={clearChat}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
      
      {apiErrorMessage && (
        <div className="api-error-banner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div>
            <p className="error-title">DeepSeek API Error</p>
            <p className="error-message">{apiErrorMessage}</p>
          </div>
        </div>
      )}
      
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
            <span className="token-value">{lastTokenUsage.promptTokens.toLocaleString()} tokens</span>
          </div>
          <div className="token-item">
            <span className="token-label">Output</span>
            <span className="token-value">{lastTokenUsage.completionTokens.toLocaleString()} tokens</span>
          </div>
          <div className="token-item">
            <span className="token-label">Cost {lastTokenUsage.pricingType && `(${lastTokenUsage.pricingType})`}</span>
            <span className="token-value">${lastTokenUsage.totalCost.toFixed(6)}</span>
          </div>
        </div>
      )}
      
      <ChatInput />
    </div>
  );
} 