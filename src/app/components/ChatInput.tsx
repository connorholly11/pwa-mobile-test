'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

// Interface for SpeechRecognition events
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Interface for Web Speech API's SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number; // Added for better results
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Declare the global types for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Create browser compatible SpeechRecognition object
const SpeechRecognitionAPI = typeof window !== 'undefined' ? 
  (window.SpeechRecognition || window.webkitSpeechRecognition) : 
  null;

export default function ChatInput() {
  const { addMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const maxRetries = 2; // Maximum number of automatic retries
  
  // Flag to track if the component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMountedRef.current = true;
    
    // Set isMounted to false when component unmounts
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize speech recognition only once when component mounts
  useEffect(() => {
    let recognitionInstance: SpeechRecognition | null = null;
    
    if (SpeechRecognitionAPI) {
      recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 3; // Get up to 3 alternative transcriptions
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        // Reset failed attempts on successful recognition
        setFailedAttempts(0);
        
        // Get the most confident transcript
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('🎙️ Speech recognized:', transcript, 'Confidence:', confidence);
        setMessage(transcript);
        setIsListening(false);
        setErrorMessage(null);
        
        // Auto-submit the recognized speech after a short delay
        setTimeout(() => {
          if (isMountedRef.current && transcript.trim()) {
            addMessage(transcript, 'user');
            setMessage('');
          }
        }, 500); // Small delay to let the user see what was recognized
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('🎙️ Speech recognition error:', event.error, event.message);
        
        // Increment failed attempts for network errors
        if (event.error === 'network') {
          setFailedAttempts(prev => prev + 1);
        }
        
        setIsListening(false);
        
        // Show appropriate error message based on the error type
        if (event.error === 'network') {
          if (failedAttempts >= maxRetries) {
            setErrorMessage('Speech recognition unavailable. Please type your message instead or try again later.');
          } else {
            setErrorMessage(`Network issue with speech recognition. Retry ${failedAttempts + 1}/${maxRetries + 1}`);
            
            // Auto-retry after a delay
            setTimeout(() => {
              if (isMountedRef.current && recognition) {
                setIsListening(true);
                recognition.start();
              }
            }, 1500);
          }
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Microphone access denied. Please allow microphone permission in your browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please try again and speak clearly.');
        } else if (event.error === 'aborted') {
          // Don't show error for user-initiated abort
          setErrorMessage(null);
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        
        // Clear error message after 5 seconds
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        
        errorTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setErrorMessage(null);
          }
        }, 5000);
      };
      
      recognitionInstance.onend = () => {
        if (isMountedRef.current) {
          setIsListening(false);
        }
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Cleanup function that uses the local variable instead of state
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [addMessage]); // Only depends on addMessage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      // Add user message
      await addMessage(message, 'user');
      
      // Clear input
      setMessage('');
      // Reset failed attempts when user manually submits text
      setFailedAttempts(0);
    }
  };

  const toggleListening = () => {
    // Reset failed attempts counter when user manually initiates speech recognition
    setFailedAttempts(0);
    
    if (!recognition) {
      console.error('🎙️ Speech recognition not supported in this browser');
      // Show a toast or alert to the user that their browser doesn't support speech recognition
      setErrorMessage('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setMessage('');
      try {
        recognition.start();
        setIsListening(true);
        setErrorMessage(null);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setErrorMessage('Failed to start speech recognition. Please try again.');
      }
    }
  };

  return (
    <div className="chat-input-wrapper">
      {errorMessage && (
        <div className="speech-error-message">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "AI is thinking..." : isListening ? "Listening..." : "Type your message..."}
          className={`chat-input ${isListening ? 'listening' : ''}`}
          disabled={isLoading || isListening}
        />
        
        <button 
          type="button"
          onClick={toggleListening}
          className={`mic-button ${isListening ? 'active' : ''}`}
          disabled={isLoading || failedAttempts > maxRetries}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            {isListening ? (
              // Stop icon when listening
              <path d="M12 2c1.1 0 2 .9 2 2v5.5l7 7v-2.5c0-.8-.7-1.5-1.5-1.5S18 13.2 18 14H6c0-.8-.7-1.5-1.5-1.5S3 13.2 3 14v2.5l7-7V4c0-1.1.9-2 2-2z" />
            ) : (
              // Microphone icon when not listening
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            )}
          </svg>
        </button>
        
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
    </div>
  );
}