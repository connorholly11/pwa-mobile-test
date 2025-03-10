'use client';

import { useState, useRef } from 'react';
import { Message, useChat } from '../contexts/ChatContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { createAudioFromBase64 } from '../utils/humeApi';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { showReasoning, generateAudioForMessage, aiPersonality } = useChat();
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  // Handle speak button click
  const handleSpeak = async () => {
    // If audio is already loaded, play it
    if (message.audioData && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
        }
      }
      return;
    }
    
    // Otherwise, generate the audio
    if (!message.isAudioLoading && !message.audioData) {
      await generateAudioForMessage(message.id);
    }
  };
  
  // Initialize audio element when audio data is available
  if (message.audioData && !audioRef.current) {
    audioRef.current = createAudioFromBase64(message.audioData);
    
    // Add event listeners to handle play state
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.onerror = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };
  }
  
  // Determine bubble class based on message type
  let bubbleClass = '';
  let contentClass = '';
  
  if (message.sender === 'user') {
    bubbleClass = 'user';
    contentClass = '';
  } else if (message.isError) {
    bubbleClass = 'ai';
    contentClass = 'error';
  } else if (message.isNotification) {
    bubbleClass = 'ai';
    contentClass = 'notification';
  } else {
    bubbleClass = `ai ${aiPersonality}`;
    contentClass = '';
  }
  
  return (
    <div className={`chat-bubble ${bubbleClass}`}>
      <div className={`chat-content ${contentClass}`}>
        {message.isError && (
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
        )}
        <p>{message.text}</p>
        
        {message.sender === 'ai' && !message.isError && !message.isNotification && (
          <div className="message-actions">
            {/* Speak button */}
            <button 
              className={`speak-button ${message.isAudioLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`}
              onClick={handleSpeak}
              disabled={message.isAudioLoading}
              aria-label={isPlaying ? 'Stop speaking' : 'Speak this message'}
            >
              {message.isAudioLoading ? (
                <div className="loading-dot-container">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
              <span>{message.isAudioLoading ? 'Loading voice...' : isPlaying ? 'Stop' : 'Speak'}</span>
            </button>
          </div>
        )}
        
        {message.audioError && (
          <div className="audio-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>Voice error: {message.audioError}</span>
          </div>
        )}
        
        {message.sender === 'ai' && message.reasoning && showReasoning && (
          <div className={`reasoning-section ${expanded ? 'expanded' : ''}`}>
            <button 
              className="reasoning-toggle" 
              onClick={toggleExpanded}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide reasoning' : 'Show reasoning'}
            </button>
            
            {expanded && (
              <div className="reasoning-content">
                <h4>AI&apos;s reasoning process:</h4>
                <pre>{message.reasoning}</pre>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="timestamp">
        {formatTimeAgo(new Date(message.timestamp))}
      </div>
    </div>
  );
}