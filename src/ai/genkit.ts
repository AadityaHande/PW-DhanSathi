import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Check if API key is configured
// const hasApiKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

// Only initialize with googleAI plugin if API key exists
export const ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-1.5-flash',
    });

export const isAIConfigured = true;
