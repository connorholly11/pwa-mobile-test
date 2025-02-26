// DeepSeek API integration
// Based on documentation from deepseek.md

// The API key is loaded from .env file
const DEEPSEEK_API_KEY = 'sk-f4c6d68f00d843edba1aaa17f0968061';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ApiResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function getChatResponse(messages: DeepSeekMessage[]): Promise<ApiResponse> {
  console.log('🚀 Sending request to DeepSeek API with messages:', messages);
  console.log(`🔗 API URL: ${DEEPSEEK_API_URL}`);
  
  try {
    console.time('⏱️ DeepSeek API Response Time');
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // DeepSeekV3
        messages: messages,
        stream: false
      })
    });

    console.timeEnd('⏱️ DeepSeek API Response Time');
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DeepSeek API error:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    console.log('📦 DeepSeek API response data:', {
      id: data.id,
      model: data.model,
      usage: data.usage,
      finish_reason: data.choices?.[0]?.finish_reason
    });
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      console.log(`✅ Received response: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
      
      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined
      };
    } else {
      console.error('❌ No choices in API response');
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('❌ Error calling DeepSeek API:', error);
    return {
      content: "I'm having trouble connecting right now. Please try again later."
    };
  }
} 