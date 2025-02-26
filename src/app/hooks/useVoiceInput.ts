'use client';

import { useState, useEffect, useCallback } from 'react';

// Define types for the Web Speech API
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  [index: number]: any; // Allow numeric indexing for browser compatibility
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Define proper SpeechRecognition interface that matches browser implementations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  
  // Fix event handlers with the correct types
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}

// Browser-specific type declaration
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  voiceSupported: boolean;
  error: string | null;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Check browser support
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        // Set up event handlers
        recognitionInstance.onstart = () => {
          console.log('🎤 Voice recognition started');
          setIsListening(true);
        };
        
        recognitionInstance.onend = () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
        };
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          // Safely access transcript if available
          if (event.results && event.results[current]) {
            const result = event.results[current];
            if (result[0]) {
              const transcript = result[0].transcript;
              setTranscript(transcript);
            }
          }
        };
        
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('🎤 Error in speech recognition:', event.error);
          setError(event.error);
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
        setVoiceSupported(true);
      } else {
        console.log('🎤 Speech recognition not supported in this browser');
        setVoiceSupported(false);
        setError('Speech recognition not supported in this browser');
      }
    } catch (err) {
      console.error('🎤 Error initializing speech recognition:', err);
      setVoiceSupported(false);
      setError('Failed to initialize speech recognition');
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        setTranscript('');
        recognition.start();
      } catch (err) {
        console.error('🎤 Error starting speech recognition:', err);
        setError('Error starting speech recognition');
      }
    } else if (!recognition) {
      setError('Speech recognition not available');
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('🎤 Error stopping speech recognition:', err);
      }
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (err) {
          console.error('🎤 Error stopping speech recognition on cleanup:', err);
        }
      }
    };
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    voiceSupported,
    error
  };
} 