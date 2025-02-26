// Hume AI Text-to-Speech API Integration
// Based on Hume AI API documentation

// API endpoint for Hume TTS
const HUME_TTS_API_URL = 'https://api.hume.ai/v0/tts';

// Voice description for our wise old man character
const WISE_OLD_MAN_VOICE_DESCRIPTION = 
  "Elderly British masculine voice with a raspy quality. Speaks softly but clearly, with a contemplative and measured pace. Has a warm, sympathetic tone but delivers words with authority and directness. Speaks as if giving life lessons with a hint of wisdom acquired through years of experience.";

// Store voice IDs if we create persistent voices
let savedVoiceId: string | null = null;

// Interface for the generation object structure
interface HumeGeneration {
  generation_id?: string;
  id?: string;
  duration?: number;
  file_size?: number;
  encoding?: unknown; // Changed from any to unknown for better type safety
  // Handle both possible audio formats
  audio?: string | {
    audio_data?: string;
  };
}

// Interface for the Hume API response
interface HumeApiResponse {
  generations: Array<HumeGeneration>;
  request_id?: string;
}

// Define interface for utterance
interface Utterance {
  text: string;
  description: string;
  voice_id?: string; // Make voice_id optional
}

/**
 * Get the Hume API key from environment variables
 * @returns The API key or throws an error if not found
 */
function getHumeApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY || '';
  
  if (!apiKey) {
    console.error('❌ Hume API key not found in environment variables');
    throw new Error('Hume API key is missing');
  }
  
  return apiKey;
}

/**
 * Extracts audio data from a generation object, handling different response formats
 * @param generation The generation object from the API response
 * @returns The base64 audio data or null if not found
 */
function extractAudioData(generation: HumeGeneration): string | null {
  // Log the generation object to see what we're working with
  console.log('🔍 Examining generation object:', JSON.stringify(generation).substring(0, 200) + '...');
  
  // Case 1: Audio is a string directly
  if (typeof generation.audio === 'string') {
    console.log('✅ Found audio as direct string');
    return generation.audio;
  }
  
  // Case 2: Audio is an object with audio_data property
  if (generation.audio && typeof generation.audio === 'object' && generation.audio.audio_data) {
    console.log('✅ Found audio in audio.audio_data property');
    return generation.audio.audio_data;
  }

  // Case 3: No audio found in the expected locations
  console.error('❌ No audio data found in generation object');
  return null;
}

/**
 * Converts text to speech using Hume AI API
 * @param text The text to convert to speech
 * @returns Promise with base64 encoded audio data
 */
export async function textToSpeech(text: string): Promise<string> {
  console.log('🎙️ Converting text to speech via Hume AI:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  
  try {
    // Create request body with properly typed utterance
    const utterance: Utterance = {
      text: text,
      description: WISE_OLD_MAN_VOICE_DESCRIPTION
    };
    
    // If we have a saved voice, use it (for consistency)
    if (savedVoiceId) {
      utterance.voice_id = savedVoiceId;
    }
    
    const requestBody = {
      utterances: [utterance],
      format: {
        type: "mp3"
      },
      num_generations: 1
    };
    
    console.log('📦 Sending request to Hume AI with data:', JSON.stringify(requestBody).substring(0, 200) + '...');
    
    // Get API key
    const apiKey = getHumeApiKey();
    console.log('🔑 Using API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3));
    
    // Call the Hume API
    const response = await fetch(HUME_TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': apiKey
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hume API error:', response.status, errorText);
      throw new Error(`Hume API error: ${response.status} - ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json() as HumeApiResponse;
    
    // Log the full response for debugging
    console.log('📥 Received raw API response:', JSON.stringify(data).substring(0, 300) + '...');
    
    if (!data.generations || data.generations.length === 0) {
      console.error('❌ Hume API returned empty generations array:', data);
      throw new Error('Hume API returned no audio data');
    }
    
    // Extract audio data handling different response formats
    const audioData = extractAudioData(data.generations[0]);
    
    if (!audioData) {
      throw new Error('Hume API response missing audio data');
    }
    
    // Get the ID from wherever it is
    const generationId = data.generations[0].generation_id || data.generations[0].id;
    console.log('✅ Received Hume AI response, generation ID:', generationId);
    
    if (data.generations[0].duration) {
      console.log('📊 Audio stats: Duration:', data.generations[0].duration.toFixed(2), 'seconds');
    }
    
    if (data.generations[0].file_size) {
      console.log('📊 Audio size:', Math.round(data.generations[0].file_size / 1024), 'KB');
    }
    
    // Save the voice ID for future use if we don't have one yet
    if (!savedVoiceId && generationId) {
      savedVoiceId = generationId;
      console.log('💾 Saved voice ID for consistent TTS:', savedVoiceId);
    }
    
    // Return the base64 encoded audio
    return audioData;
  } catch (error) {
    console.error('❌ Error calling Hume API:', error);
    throw new Error('Failed to convert text to speech: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get audio element with base64 encoded mp3
 * @param base64Audio Base64 encoded audio data
 * @returns HTML Audio element
 */
export function createAudioFromBase64(base64Audio: string): HTMLAudioElement {
  try {
    // Check if we're in a browser environment before using browser APIs
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      throw new Error('Audio API is not available (server-side rendering)');
    }
    
    // Log the first few characters of the base64 string for debugging
    console.log('🔍 Creating audio from base64 data:', base64Audio.substring(0, 30) + '...');
    
    // Try to fix or validate base64 string if needed
    let validBase64 = base64Audio;
    
    // If it doesn't start with proper base64 characters, it might be missing padding
    if (!validBase64.match(/^[a-zA-Z0-9+/]/)) {
      console.warn("⚠️ Base64 data doesn't start with expected characters, attempting to fix");
      // Try adding proper encoding prefix if missing
      if (!validBase64.startsWith('/')) {
        validBase64 = '/' + validBase64;
      }
    }
    
    const audio = new Audio(`data:audio/mp3;base64,${validBase64}`);
    
    // Add event handlers for debugging audio playback
    audio.onloadeddata = () => {
      console.log('✅ Audio data loaded successfully, duration:', audio.duration, 'seconds');
    };
    
    audio.onplay = () => {
      console.log('▶️ Audio playback started');
    };
    
    // Add error handler to log audio loading issues
    audio.onerror = (e) => {
      console.error('❌ Error loading audio:', e);
    };
    
    return audio;
  } catch (error) {
    console.error('❌ Error creating audio from base64:', error);
    throw new Error('Could not create audio element: ' + (error instanceof Error ? error.message : String(error)));
  }
} 