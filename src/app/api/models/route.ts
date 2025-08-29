import { NextResponse } from 'next/server';
import { AI_MODELS } from '@/config/models';

export async function GET() {
  try {
    // Set up Google API key with the correct environment variable name
    if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
    }
    if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
    }
    
    // Filter models based on available API keys - all are optional
    const availableModels = AI_MODELS.filter(model => {
      switch (model.provider) {
        case 'openai':
          return !!process.env.OPENAI_API_KEY;
        case 'anthropic':
          return !!process.env.ANTHROPIC_API_KEY;
        case 'google':
          return !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
        case 'groq':
          return !!process.env.GROQ_API_KEY;
        case 'cohere':
          return !!process.env.COHERE_API_KEY;
        default:
          return false;
      }
    });

    // Always return success, even with 0 models - let the frontend handle it
    return NextResponse.json({
      models: availableModels,
      count: availableModels.length,
      message: availableModels.length === 0 
        ? 'No API keys configured yet. Add your API keys in Vercel environment variables to enable models.' 
        : `Found ${availableModels.length} available models`
    });
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}