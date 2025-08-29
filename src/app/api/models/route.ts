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
    
    // Filter models based on available API keys
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

    // If no models are available, return an error with helpful message
    if (availableModels.length === 0) {
      return NextResponse.json(
        { 
          error: 'No API keys configured. Please add at least one of: GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, COHERE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY',
          models: [],
          count: 0
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      models: availableModels,
      count: availableModels.length,
      message: `Found ${availableModels.length} available models`
    });
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}