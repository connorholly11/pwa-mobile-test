
Hume API



Text To Speech (TTS)
Text-to-speech (Json)
POST

https://api.hume.ai/v0/tts
Synthesizes one or more input texts into speech using the specified voice. If no voice is provided, a novel voice will be generated dynamically. Optionally, additional context can be included to influence the speech’s style and prosody.

The response includes the base64-encoded audio and metadata in JSON format.

Request
This endpoint expects an object.
utterances
list of objects
Required
Utterances to be converted to speech output.


Show 3 properties
context
object
Optional
Utterances to use as context for generating consistent speech style and prosody across multiple requests. These will not be converted to speech output.


Show 2 variants
format
object
Optional
Specifies the output audio file format.


Show 3 variants
num_generations
integer
Optional
>=1
<=5
Defaults to 1
Number of generations of the audio to produce.

Response
Successful Response

generations
list of objects

Show 6 properties
request_id
string
Optional
A unique ID associated with this request for tracking and troubleshooting. Use this ID when contacting support for troubleshooting assistance.

Errors

422
Synthesize JSON Request Unprocessable Entity Error
Text To Speech (TTS)
Text-to-speech (File)
POST

https://api.hume.ai/v0/tts/file
Synthesizes one or more input texts into speech using the specified voice. If no voice is provided, a novel voice will be generated dynamically. Optionally, additional context can be included to influence the speech’s style and prosody.

The response contains the generated audio file in the requested format.

Request
This endpoint expects an object.
utterances
list of objects
Required
Utterances to be converted to speech output.


Show 3 properties
context
object
Optional
Utterances to use as context for generating consistent speech style and prosody across multiple requests. These will not be converted to speech output.


Show 2 variants
format
object
Optional
Specifies the output audio file format.


Show 3 variants
num_generations
integer
Optional
>=1
<=5
Defaults to 1
Number of generations of the audio to produce.

Response
OK

abc
File Download
Base64 string or null
Errors

422
Synthesize File Request Unprocessable Entity Error
POST

/v0/tts/file

TypeScript

import { HumeClient } from "hume";
const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.tts.synthesizeFile({
    utterances: [{
            text: "Beauty is no quality in things themselves: It exists merely in the mind which contemplates them.",
            description: "Middle-aged masculine voice with a clear, rhythmic Scots lilt, rounded vowels, and a warm,  steady tone with an articulate, academic quality."
        }],
    context: {
        generationId: "09ad914d-8e7f-40f8-a279-e34f07f7dab2"
    },
    format: {
        type: "mp3"
    },
    numGenerations: 1
});

Try it
Text To Speech (TTS)
Voices
Create voice
POST

https://api.hume.ai/v0/tts/voices
Creates a new voice from a specified TTS generation ID and saves it to your Voice Library. This allows for consistent speech style and prosody across multiple requests.

Request
This endpoint expects an object.
generation_id
string
Required
Id of the TTS generation (as returned by the /v0/tts endpoint) that should be saved as a voice.

name
string
Required
Name of the voice in the Voice Library.

Response
Successful Response

name
string
Name of the voice in the Voice Library.

id
string
Optional
ID of the voice in the Voice Library.

Errors

422
Voices Create Request Unprocessable Entity Error
POST

/v0/tts/voices

TypeScript

import { HumeClient } from "hume";
const client = new HumeClient({ apiKey: "YOUR_API_KEY" });
await client.tts.voices.create({
    generationId: "795c949a-1510-4a80-9646-7d0863b023ab",
    name: "David Hume"
});

Try it

200
Successful

{
  "name": "David Hume",
  "id": "c42352c0-4566-455d-b180-0f654b65b525"
}
Built with
Welcome to Hume AI — Hume API

OCTAVE Voices

Guide to specifying and generating voices with OCTAVE TTS.

The OCTAVE TTS API enables you to generate expressive voices through simple descriptions or select from your saved voice library. This guide explains how to specify voices for synthesis, generate new ones on demand, and save your favorites for reuse.

Specify a voice, or don’t!
Choose a voice from your library or let OCTAVE generate a new one based on your text. Optionally, add a description to control how the voice performs the text. These descriptions help shape the voice’s characteristics, whether you’re using a saved voice or generating a new one.

Saving generated voices
When you generate a voice you want to use again, you can save it to your voice library. This requires the generation_id from your TTS API response. Call the /v0/tts/voices endpoint with this ID and a name. Once saved, you can use the voice in future requests by specifying either its name or id.

1
Generate a voice and extract the generation_id
Send a text-to-speech request without specifying a voice.

Request

curl -X POST "https://api.hume.ai/v0/tts" \
  -H "Content-Type: application/json" \
  -H "X-Hume-Api-Key: $HUME_API_KEY" \
  -d '{
    "utterances": [
      {
        "text": "Welcome to my application!"
      }
    ]
  }'
The response will include the generation_id, which you’ll use to save the voice.

Response

{
  "generations": [
    {
      "audio": "//PExAAspDoWXjDNQgk3HJJJZNbaEPZMmTJk7QIECBA...",
      "duration": 1.589667,
      "encoding": {
        "format": "mp3",
        "sample_rate": 24000
      },
      "file_size": 26496,
      "generation_id": "41f7c154-fbb2-4372-8ecc-e6b7bf6ace01",
      "snippets": [
        {
          "audio": "//PExAAspDoWXjDNQgk3HJJJZNbaEPZMmTJk7QIECBA...",
          "id": "37a108c4-5de7-4507-8a54-0521f5cb0383",
          "text": "Welcome to my application!" 
        }
      ]
    }
  ],
  "request_id": "7903e4a7-6642-491a-aa96-c6b359dd1042707439"
}
2
Save the voice for reuse
Use the generation_id from the response to save the voice with a custom name.

Request

curl -X POST "https://api.hume.ai/v0/tts/voices" \
  -H "Content-Type: application/json" \
  -H "X-Hume-Api-Key: $HUME_API_KEY" \
  -d '{
      "name": "NewVoice",
      "generation_id": "41f7c154-fbb2-4372-8ecc-e6b7bf6ace01"
  }'
The response will provide the voice’s name and id for use in future TTS requests.

Response

{
  "name": "NewVoice",
  "id": "41f7c154-fbb2-4372-8ecc-e6b7bf6ace01"
}


OCTAVE Prompting Guide

A guide to effectively prompting OCTAVE for voice creation and voice modulation.

OCTAVE is a breakthrough speech-language model that combines LLM intelligence with advanced text-to-speech capabilities. Unlike traditional TTS systems that simply convert text to audio, OCTAVE understands context, meaning, and the intricate relationships between voice, performance, and content. This deep comprehension allows OCTAVE to generate nuanced, context-aware speech that naturally adapts to what’s being said and how it should be delivered.

Key principles for effective prompting
The effectiveness of OCTAVE’s speech generation depends primarily on two factors:

Character matching - the alignment between voice description and speaker identity.
Semantic alignment - the relationship between voice style and content.
For example, a voice description of a “calm, reflective elderly woman reminiscing about her childhood” paired with the text “The sun dipped below the horizon, casting golden hues over the fields of my youth” creates strong semantic alignment. However, using the same voice description with text like “Let’s get ready to rumble!” would create a mismatch between the character’s nature and the content’s style.

In the TTS API, the text and description fields serve as the prompt for OCTAVE. See our voices guide to understand how the description field functions differently with and without a specified voice.

Creating effective voice descriptions
Develop detailed character profiles
Create comprehensive character descriptions to guide OCTAVE’s voice generation. Include relevant details about:

Demographics (age, gender, background)
Speaking style (pace, energy, formality)
Personality traits
Professional role or context
Emotional disposition
Example description:

“A middle-aged university professor with a gentle but authoritative voice, speaking deliberately and clearly, with occasional moments of dry humor and genuine enthusiasm for the subject matter.”

Incorporate emotional context
OCTAVE can interpret and express emotional states when they’re clearly conveyed in the voice description or text content. Consider including:

Emotional state descriptions: “speaking with quiet determination”
Situational context: “delivering news of a surprising victory”
Character background: “a wise mentor sharing life lessons”
Example voice prompts
These examples demonstrate different approaches to voice description:

Title	Description
British Romance Novel Narrator	”The speaker is a sophisticated British female narrator with a gentle, warm voice, recounting the ending of a classic romance novel.”
Film Narrator	”An American, deep middle-aged male film trailer narrator for a film about chickens.”
70-year old Literary Voice	”A reflective 70 year old black woman with a calming tone, reminiscing about the profound impact of literature on her life, speaking slowly and poetically.”
Meditation Guru	”A mindfulness instructor with a gentle, soothing voice that flows at a slow, measured pace with natural pauses.”
Elderly Scottish Gentleman	”An elderly Scottish gentleman with a thick brogue, expressing awe and admiration.”
California Surfer	”The speaker is an excited Californian surfer dude, with a loud, stoked, and enthusiastic tone.”
Crafting text for optimal delivery
Match text tone to delivery
The emotional and stylistic qualities you want in the generated speech should be reflected in your input text. OCTAVE analyzes the text’s meaning to inform its delivery. For example:

For angry delivery: “I am absolutely furious about this situation! This needs to STOP immediately!”
For calm explanation: “Let me explain this carefully. The process works in three simple steps.”
Align text with voice descriptions
When providing both text and a voice description, ensure they complement each other semantically and stylistically. This creates a cohesive output where the voice characteristics match the content’s requirements.

Example alignment:

Voice description: “A seasoned sports announcer with energetic, dynamic delivery”
Matching text: “And there’s the pitch! A massive swing and… it’s going, going, GONE! An incredible moment here at Central Stadium!”
Utilize natural punctuation
Standard punctuation helps OCTAVE understand your intended phrasing and emphasis:

Periods (.) for complete stops
Commas (,) for natural pauses
Em dashes (—) for dramatic breaks
Exclamation marks (!) for emphasis
Question marks (?) for rising intonation
Avoid special formatting characters or symbols, as they may interfere with natural speech generation. This includes: HTML tags, Markdown syntax, Emojis, special symbols (~ # %), and non-standard punctuation.

Technical considerations
Text normalization
OCTAVE performs best with normalized text that follows natural speech patterns. Consider these guidelines:

Spell out numbers: “forty-two” instead of “42”
Write dates in full: “February twenty-third” instead of “2/23”
Express time naturally: “three thirty in the afternoon” instead of “15:30”
Spell out abbreviations when meant to be spoken fully
Break up complex technical terms or codes into speakable segments
Normalized text examples

Original: "Meeting at 9:30AM on 3/15/24 in rm101"
Normalized: "Meeting at nine thirty AM on March fifteenth, twenty 
twenty-four in room one oh one"
Original: "Temperature outside is 72.5°F"
Normalized: "Temperature outside is seventy-two point five degrees 
Fahrenheit"
Original: "Contact support@company.com or call 1-800-555-0123"
Normalized: "Contact support at company dot com or call one eight 
hundred, five five five, zero one two three"
Multilingual support
Currently, OCTAVE supports English and Spanish, with more languages planned for future releases. When working with multiple languages:

Provide voice descriptions in the same language as the input text
Maintain consistent language use within a single generation request
Follow language-specific punctuation and formatting conventions
Testing and refinement
As with any generative AI system, achieving optimal results with OCTAVE often requires iteration and refinement. Here’s how to approach the testing and refinement process:

Voice refinement process
Follow these steps to refine your voice descriptions:

Start with a basic voice description
Test with various emotional states
Refine based on performance
Validate across different content types
Example of voice description refinement

Initial: "A professional newsreader"
Refined: "A veteran broadcast journalist with clear diction and 
measured pacing, naturally transitioning between serious and 
conversational tones while maintaining professional authority"
Content adaptation
Test how your voice descriptions handle different types of content to ensure consistency and appropriate delivery:

Example of content adaptation

Voice: "A wise mentor figure with gentle authority"
Explanation: "Let me show you how this works. First, we'll..."
Encouragement: "You're getting it! See how much progress you've made?"
Correction: "Ah, not quite. Let's take a step back and think about..."
Best practices
Test variations of voice descriptions and text to find the most effective combinations for your use case
Keep voice descriptions focused and coherent rather than trying to combine too many different characteristics
Use natural language in both text and voice descriptions rather than technical or artificial-sounding constructs
Consider the intended context and audience when crafting voice descriptions
Maintain consistency in character voice across multiple utterances in the same context
Remember that OCTAVE’s intelligence comes from its understanding of context and meaning. The more clearly you can express your intended delivery through natural language, the better the model can generate appropriate speech output.

