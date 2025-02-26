// Chat message type definitions

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  reasoning?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  };
}

// Additional chat-related types can be added here 