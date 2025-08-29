import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { generateText } from 'ai';
import { AI_MODELS } from '@/config/models';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelId = searchParams.get('model');
  
  if (!modelId) {
    return NextResponse.json({ error: 'Model parameter required' }, { status: 400 });
  }

  // Set up environment variables
  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }
  if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
  }

  const modelConfig = AI_MODELS.find(m => m.id === modelId);
  if (!modelConfig) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  }

  let model;
  try {
    switch (modelConfig.provider) {
      case 'openai':
        model = openai(modelId);
        break;
      case 'anthropic':
        model = anthropic(modelId);
        break;
      case 'google':
        model = google(modelId);
        break;
      case 'groq':
        model = groq(modelId);
        break;
      case 'cohere':
        model = cohere(modelId);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const result = await generateText({
      model,
      messages: [{ role: 'user', content: 'Say "Hello, I am working!" in a friendly way.' }],
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      model: modelId,
      provider: modelConfig.provider,
      response: result.text,
      usage: result.usage
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      model: modelId,
      provider: modelConfig.provider,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.message : 'No additional details'
    });
  }
}