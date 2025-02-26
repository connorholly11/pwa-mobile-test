// DeepSeek API integration
// Based on documentation from deepseek.md

// Correct API endpoint for DeepSeek API - uses /v1/chat/completions endpoint
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Available models in order of preference - using ONLY the Reasoner model (R1) as requested
const MODELS = [
  'deepseek-reasoner'     // Reasoning model (DeepSeek-R1)
];

// Track if we're currently using fallback mode (for UI purposes only)
// We'll still report the error but use this flag to show an indicator
let isUsingFallbackMode = false;

// Track which model is currently working
let currentModelIndex = 0;

// Export function to check if we're in fallback mode
export function getIsUsingFallbackMode(): boolean {
  return isUsingFallbackMode;
}

// Exported function to check if fallback mode is active
export function isFallbackModeActive(): boolean {
  return isUsingFallbackMode;
}

// Function to get the currently working model
export function getCurrentModel(): string {
  return MODELS[currentModelIndex];
}

// Define and export message interface for API
export interface DeepSeekMessage {
  role: string;
  content: string;
}

export interface ApiResponse {
  content: string;
  reasoning?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType: string;
  };
}

// Approximate pricing based on documentation
const PRICING = {
  STANDARD: {
    INPUT_CACHE_HIT: 0.14 / 1000000,  // $0.14 per million tokens 
    INPUT_CACHE_MISS: 0.55 / 1000000, // $0.55 per million tokens
    OUTPUT: 2.19 / 1000000,           // $2.19 per million tokens
  },
  DISCOUNT: {
    INPUT_CACHE_HIT: 0.035 / 1000000, // $0.035 per million tokens (75% off)
    INPUT_CACHE_MISS: 0.135 / 1000000, // $0.135 per million tokens (75% off)
    OUTPUT: 0.550 / 1000000,          // $0.55 per million tokens (75% off)
  }
};

// Check if we're in discount period (16:30-00:30 UTC)
function isDiscountPeriod(): boolean {
  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  const currentUtcMinute = now.getUTCMinutes();
  const currentUtcTimeDecimal = currentUtcHour + currentUtcMinute / 60;
  
  return (currentUtcTimeDecimal >= 16.5) || (currentUtcTimeDecimal < 0.5);
}

export async function getChatResponse(messages: DeepSeekMessage[]): Promise<ApiResponse> {
  // For testing/development, log the messages being sent
  console.log('📤 Sending messages to DeepSeek API:', messages);
  
  // Try each model in sequence
  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    // If this is a retry, update the model index
    if (attempt > 0) {
      currentModelIndex = attempt;
      console.log(`⚠️ Retrying with fallback model: ${MODELS[currentModelIndex]}`);
    }
    
    try {
      console.time('⏱️ DeepSeek API Response Time');
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Reset fallback mode flag on new attempt
      isUsingFallbackMode = false;
      
      // Create request body - we'll log this for debugging
      const requestBody = {
        model: MODELS[currentModelIndex],
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      };
      
      console.log(`📤 Request payload (model: ${MODELS[currentModelIndex]}):`, JSON.stringify(requestBody));
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.timeEnd('⏱️ DeepSeek API Response Time');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API error with model ${MODELS[currentModelIndex]} (${response.status}):`, errorText);
        
        // Set fallback mode flag for UI indicator only if this is the last model to try
        if (attempt === MODELS.length - 1) {
          isUsingFallbackMode = true;
          
          // Return error with specific status code information and include the raw error message if available
          let errorMessage = "An error occurred while connecting to the AI service.";
          
          // Customize error message based on HTTP status code
          if (response.status === 400) {
            errorMessage = "Bad request - The API request was malformed or incorrect.";
            if (errorText) {
              try {
                // Try to parse the error JSON if possible
                const errorJson = JSON.parse(errorText);
                if (errorJson.error && errorJson.error.message) {
                  errorMessage += ` Details: ${errorJson.error.message}`;
                }
              } catch {
                // If we can't parse JSON, include the raw text
                errorMessage += ` Details: ${errorText.substring(0, 100)}`;
              }
            }
          } else if (response.status === 401) {
            errorMessage = "Authentication failed. Invalid API key.";
          } else if (response.status === 402) {
            errorMessage = "Account has insufficient balance.";
          } else if (response.status === 422) {
            errorMessage = "Invalid parameters in the request.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please try again later.";
          } else if (response.status === 500) {
            errorMessage = "Server error. The DeepSeek API is experiencing issues.";
          } else if (response.status === 503) {
            errorMessage = "Service unavailable. The DeepSeek API is overloaded.";
          }
          
          throw new Error(`${errorMessage} (Status: ${response.status})`);
        }
        
        // If not the last model, continue to the next one
        continue;
      }
      
      // If we get here, the request was successful
      const data = await response.json();
      console.log(`📥 DeepSeek API response (model: ${MODELS[currentModelIndex]}):`, data);
      
      // Calculate the token costs
      const pricing = isDiscountPeriod() ? PRICING.DISCOUNT : PRICING.STANDARD;
      const pricingType = isDiscountPeriod() ? 'Discount' : 'Standard';
      
      // Extract token counts from response
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      
      // Calculate costs using cache miss pricing as default
      const promptCost = promptTokens * pricing.INPUT_CACHE_MISS;
      const completionCost = completionTokens * pricing.OUTPUT;
      const totalCost = promptCost + completionCost;
      
      console.log(`💰 Estimated cost: $${totalCost.toFixed(6)} (${pricingType} rate)`);
      
      // Extract reasoning if available
      let reasoning = undefined;
      
      // Standard models don't have reasoning by default
      // But if we add it back later, this code will still work
      if (data.choices && data.choices[0]) {
        // Just in case we re-add function calling later
        if (data.choices[0].message?.tool_calls?.length > 0) {
          const reasoningCall = data.choices[0].message.tool_calls.find(
            (call: {function?: {name: string}}) => call.function?.name === 'reasoning'
          );
          
          if (reasoningCall?.function) {
            try {
              const args = JSON.parse(reasoningCall.function.arguments);
              reasoning = args.reasoning;
              console.log('📝 Extracted reasoning from tool call:', reasoning.substring(0, 100) + '...');
            } catch (e) {
              console.warn('⚠️ Failed to parse reasoning:', e);
            }
          }
        } 
        // Check for reasoning_content (for R1 model if supported)
        else if (data.choices[0].reasoning_content) {
          reasoning = data.choices[0].reasoning_content;
          console.log('📝 Found reasoning_content:', reasoning.substring(0, 100) + '...');
        }
      }
      
      return {
        content: data.choices[0].message.content,
        reasoning: reasoning,
        usage: {
          promptTokens,
          completionTokens,
          totalCost,
          pricingType
        }
      };
      
    } catch (error) {
      if (attempt === MODELS.length - 1) {
        console.error('❌ Error calling DeepSeek API with all models:', error);
        
        // Set fallback mode flag for UI indicator
        isUsingFallbackMode = true;
        
        // Return the error directly instead of creating a fallback response
        throw error;
      }
      
      // If not the last model, continue to the next one
      console.warn(`⚠️ Error with model ${MODELS[currentModelIndex]}, trying next model:`, error);
    }
  }
  
  // This should never be reached due to the error handling above
  throw new Error('Failed to get a response from any DeepSeek model');
} 