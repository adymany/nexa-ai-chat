import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { getModelById } from '@/config/models';
import { ChatRequest } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    // Set up Google API key with the correct environment variable name
    if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
    }
    if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
    }
    
    const body: ChatRequest = await req.json();
    const { messages, model: modelId, stream = true, temperature = 0.7 } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    // Simple message formatting - just take the last user message for problematic providers
    let formattedMessages: Array<{role: 'user' | 'assistant' | 'system', content: string}>;
    
    if (modelConfig.provider === 'cohere') {
      // Cohere is very picky - just send the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user' && msg.content.trim());
      if (!lastUserMessage) {
        return NextResponse.json({ error: 'No user message found' }, { status: 400 });
      }
      formattedMessages = [{
        role: 'user' as const,
        content: lastUserMessage.content.trim()
      }];
    } else {
      // For other providers, filter and clean messages
      formattedMessages = messages
        .filter(msg => msg.content && msg.content.trim().length > 0)
        .map(msg => ({
          role: (msg.role === 'system' ? 'user' : msg.role) as 'user' | 'assistant' | 'system',
          content: msg.content.trim(),
        }));
    }

    if (formattedMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages' }, { status: 400 });
    }

    let model;
    
    // Select the appropriate provider
    switch (modelConfig.provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }
        model = openai(modelId);
        break;
        
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
        }
        model = anthropic(modelId);
        break;
        
      case 'google':
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
          return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
        }
        model = google(modelId);
        break;
        
      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
        }
        model = groq(modelId);
        break;
        
      case 'cohere':
        if (!process.env.COHERE_API_KEY) {
          return NextResponse.json({ error: 'Cohere API key not configured' }, { status: 500 });
        }
        model = cohere(modelId);
        break;
        
      default:
        return NextResponse.json({ error: 'Unsupported model provider' }, { status: 400 });
    }

    try {
      if (stream) {
        const result = await streamText({
          model,
          messages: formattedMessages,
          temperature,
        });
        return result.toTextStreamResponse();
      } else {
        const result = await generateText({
          model,
          messages: formattedMessages,
          temperature,
        });

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            role: 'assistant',
            content: result.text,
            timestamp: new Date(),
            model: modelId,
          },
          model: modelId,
          usage: result.usage,
        });
      }
    } catch (error: any) {
      console.error(`${modelConfig.provider} error for model ${modelId}:`, error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = `${modelConfig.provider} API key is invalid or missing`;
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = `${modelConfig.provider} quota or rate limit exceeded`;
        } else if (error.message.includes('model')) {
          errorMessage = `Model ${modelId} is not available or not supported`;
        } else {
          errorMessage = error.message;
        }
      }
      
      return NextResponse.json(
        { 
          error: `${modelConfig.provider} error: ${errorMessage}`,
          provider: modelConfig.provider,
          model: modelId,
          details: error.message || 'No additional details'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}