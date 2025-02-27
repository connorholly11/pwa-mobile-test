// Define shared types for Web Speech API that can be used across components

// Common Speech Recognition Result interfaces
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  [index: number]: unknown;
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

// Base Speech Recognition interface
interface SpeechRecognitionBase extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}

// Extended interface for ChatInput.tsx
interface SpeechRecognitionWithAlternatives extends SpeechRecognitionBase {
  maxAlternatives: number;
}

// Global declarations
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionBase;
    webkitSpeechRecognition?: new () => SpeechRecognitionBase;
  }
}

export { 
  SpeechRecognitionBase, 
  SpeechRecognitionWithAlternatives,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionResult,
  SpeechRecognitionResultList
}; 