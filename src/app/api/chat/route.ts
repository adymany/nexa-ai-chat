import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { getModelById } from '@/config/models';
import { ChatRequest } from '@/types/chat';
import { createMessage } from '@/lib/database';
import { prisma } from '@/lib/prisma';

// Add OpenRouter provider
import { createOpenAI } from '@ai-sdk/openai';

// Helper function to clean up OpenRouter responses
function cleanOpenRouterResponse(text: string): string {
  // Remove common special tokens and formatting artifacts
  return text
    .replace(/<\|im_end_id\|>/g, '')
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    .replace(/\[\/INST\]/g, '')
    .replace(/\[INST\]/g, '')
    .replace(/\[OUT\]/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// Define fallback models for each provider
const FALLBACK_MODELS: Record<string, string[]> = {
  'groq': [
    'llama-3.1-8b-instant',
    'llama3-groq-8b-8192-tool-use-preview',
    'gemma2-9b-it'
  ],
  'google': [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ],
  'openrouter': [
    'openrouter/auto',
    'mistralai/mistral-7b-instruct'
  ],
  'cohere': [
    'command-r7b-12-2024'
  ],
  'anthropic': [
    'claude-3-haiku-20240307'
  ],
  'openai': [
    'gpt-3.5-turbo'
  ]
};

// Helper function to get fallback model
function getFallbackModel(provider: string, currentModel: string): string | null {
  const fallbacks = FALLBACK_MODELS[provider];
  if (!fallbacks) return null;
  
  // Return the first available fallback model that's not the current model
  const fallback = fallbacks.find(model => model !== currentModel);
  return fallback || null;
}

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
    let { messages, model: modelId, stream = true, temperature = 0.7, chatSessionId } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    let modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    // Simple message formatting - just take the last user message for problematic providers
    let formattedMessages: Array<{role: 'user' | 'assistant' | 'system', content: string}>;
    
    if (modelConfig.provider === 'cohere' || modelConfig.provider === 'openrouter') {
      // Cohere and OpenRouter are very picky - just send the last user message
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
        .filter((msg: any) => msg.content && msg.content.trim().length > 0)
        .map((msg: any) => ({
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
          return NextResponse.json({ 
            error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables, or use a different model like Gemini or Groq.',
            suggestion: 'Try switching to Gemini 1.5 Flash or one of the Groq models which are available.'
          }, { status: 500 });
        }
        model = openai(modelId);
        break;
        
      case 'openrouter':
        if (!process.env.OPENROUTER_API_KEY) {
          return NextResponse.json({ 
            error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.',
            suggestion: 'Add your OpenRouter API key to use models through OpenRouter.'
          }, { status: 500 });
        }
        // Create OpenRouter client
        const openRouter = createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
          headers: {
            'HTTP-Referer': req.headers.get('origin') || 'http://localhost:3001',
            'X-Title': process.env.APP_NAME || 'Nexa AI Chat',
          }
        });
        model = openRouter(modelId);
        break;
        
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json({ 
            error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables, or use a different model.',
            suggestion: 'Try switching to Gemini 1.5 Flash or one of the Groq models which are available.'
          }, { status: 500 });
        }
        model = anthropic(modelId);
        break;
        
      case 'google':
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
          return NextResponse.json({ 
            error: 'Google API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.',
            suggestion: 'Add your Google AI API key to use Gemini models.'
          }, { status: 500 });
        }
        model = google(modelId);
        break;
        
      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          return NextResponse.json({ 
            error: 'Groq API key not configured. Please add GROQ_API_KEY to your environment variables.',
            suggestion: 'Add your Groq API key to use lightning-fast Llama models.'
          }, { status: 500 });
        }
        model = groq(modelId);
        break;
        
      case 'cohere':
        if (!process.env.COHERE_API_KEY) {
          return NextResponse.json({ 
            error: 'Cohere API key not configured. Please add COHERE_API_KEY to your environment variables.',
            suggestion: 'Add your Cohere API key to use the Command R7B model.'
          }, { status: 500 });
        }
        model = cohere(modelId);
        break;
        
      default:
        return NextResponse.json({ error: 'Unsupported model provider' }, { status: 400 });
    }

    try {
      // Save user message to database if chatSessionId is provided and valid
      if (chatSessionId && typeof chatSessionId === 'string' && chatSessionId.trim().length > 0) {
        // First, verify that the chat session exists
        try {
          const chatSession = await prisma.chatSession.findUnique({
            where: { id: chatSessionId.trim() }
          });
          
          if (!chatSession) {
            // Don't fail the entire request if the session ID is invalid
            // Just log the error and continue without saving messages
            console.warn(`Invalid chat session ID provided: ${chatSessionId}`);
          } else {
            // Valid session, save the user message
            const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
            if (lastUserMessage) {
              try {
                await createMessage({
                  chatSessionId: chatSessionId.trim(),
                  role: 'USER',
                  content: lastUserMessage.content,
                });
              } catch (messageError) {
                console.error('Error saving user message to database:', messageError);
                // Continue with the chat response even if we can't save the message
                // This prevents the entire chat from failing due to database issues
              }
            }
          }
        } catch (dbError) {
          console.error('Database error when checking chat session:', dbError);
          // Continue with the chat response even if we can't validate the session
        }
      }

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

        // Clean up OpenRouter responses
        let responseText = result.text;
        if (modelConfig.provider === 'openrouter') {
          responseText = cleanOpenRouterResponse(result.text);
        }

        // Save assistant response to database if chatSessionId is provided and valid
        if (chatSessionId && typeof chatSessionId === 'string' && chatSessionId.trim().length > 0) {
          try {
            const chatSession = await prisma.chatSession.findUnique({
              where: { id: chatSessionId.trim() }
            });
            
            if (chatSession) {
              // Only save if the session is valid
              try {
                await createMessage({
                  chatSessionId: chatSessionId.trim(),
                  role: 'ASSISTANT',
                  content: responseText,
                });
              } catch (messageError) {
                console.error('Error saving assistant response to database:', messageError);
                // Continue with the response even if we can't save the message
                // This prevents the entire chat from failing due to database issues
              }
            }
          } catch (dbError) {
            console.error('Database error when checking chat session for assistant message:', dbError);
            // Continue with the response even if we can't validate the session
          }
        }

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            role: 'assistant',
            content: responseText,
            timestamp: new Date(),
            model: modelId,
          },
          model: modelId,
          usage: result.usage,
        });
      }
    } catch (error: unknown) {
      console.error(`${modelConfig.provider} error for model ${modelId}:`, error);
      
      // Check if this is a model availability error and try fallback
      if (error instanceof Error && 
          (error.message.includes('not available') || error.message.includes('not supported') ||
           error.message.includes('not found') || error.message.includes('does not exist') ||
           error.message.includes('decommissioned'))) {
        
        // Try to get a fallback model
        const fallbackModelId = getFallbackModel(modelConfig.provider, modelId);
        if (fallbackModelId) {
          // Update modelId and modelConfig to use fallback
          modelId = fallbackModelId;
          modelConfig = getModelById(modelId)!; // We know it exists since it's in our fallback list
          
          // Try to create a new model instance with the fallback model
          try {
            switch (modelConfig.provider) {
              case 'openai':
                model = openai(modelId);
                break;
              case 'openrouter':
                // Create OpenRouter client
                const openRouter = createOpenAI({
                  baseURL: 'https://openrouter.ai/api/v1',
                  apiKey: process.env.OPENROUTER_API_KEY,
                  headers: {
                    'HTTP-Referer': req.headers.get('origin') || 'http://localhost:3001',
                    'X-Title': process.env.APP_NAME || 'Nexa AI Chat',
                  }
                });
                model = openRouter(modelId);
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
                throw new Error('Fallback not supported for this provider');
            }
            
            // Retry the request with the fallback model
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

              // Clean up OpenRouter responses
              let responseText = result.text;
              if (modelConfig.provider === 'openrouter') {
                responseText = cleanOpenRouterResponse(result.text);
              }

              return NextResponse.json({
                message: {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: responseText,
                  timestamp: new Date(),
                  model: modelId,
                },
                model: modelId,
                usage: result.usage,
                fallbackUsed: true,
                originalModelError: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          } catch (fallbackError) {
            console.error(`Fallback model ${fallbackModelId} also failed:`, fallbackError);
            // If fallback also fails, return the original error
          }
        }
      }
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      let errorStatus = 500;
      
      if (error instanceof Error && error.message) {
        if (error.message.includes('API key')) {
          errorMessage = `${modelConfig.provider} API key is invalid or missing`;
          errorStatus = 500;
        } else if (error.message.includes('quota') || error.message.includes('limit') || 
                   (error instanceof Object && 'statusCode' in error && error.statusCode === 429)) {
          errorMessage = `${modelConfig.provider} quota or rate limit exceeded. Please try again later or switch to a different model.`;
          errorStatus = 429;
        } else if (error.message.includes('not available') || error.message.includes('not supported') ||
                   error.message.includes('not found') || error.message.includes('does not exist') ||
                   error.message.includes('decommissioned')) {
          errorMessage = `Model ${modelId} is not available or has been decommissioned. Please try a different model.`;
          errorStatus = 400;
        } else {
          errorMessage = error.message;
          errorStatus = 500;
        }
      }
      
      // Handle AI SDK specific errors
      if (error && typeof error === 'object' && 'lastError' in error) {
        const lastError = error.lastError as any;
        if (lastError && lastError.statusCode === 429) {
          errorMessage = `${modelConfig.provider} quota or rate limit exceeded. Please try again later or switch to a different model.`;
          errorStatus = 429;
        } else if (lastError && lastError.responseBody) {
          try {
            const errorBody = JSON.parse(lastError.responseBody);
            if (errorBody.error && errorBody.error.status === 'RESOURCE_EXHAUSTED') {
              errorMessage = `${modelConfig.provider} quota or rate limit exceeded. Please check your plan and billing details.`;
              errorStatus = 429;
            }
          } catch (parseError) {
            // If we can't parse the error body, use the default error handling
          }
        }
      }
      
      return NextResponse.json(
        { 
          error: `${modelConfig.provider} error: ${errorMessage}`,
          provider: modelConfig.provider,
          model: modelId,
          details: error instanceof Error ? error.message : 'No additional details'
        },
        { status: errorStatus }
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