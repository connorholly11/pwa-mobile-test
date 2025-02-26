'use client';

import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function ChatInput() {
  const { addMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      // Add user message
      await addMessage(message, 'user');
      
      // Clear input
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
        className="chat-input"
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className={`send-button ${isLoading ? 'loading' : ''}`}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        )}
      </button>
    </form>
  );
} 