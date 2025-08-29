import { AIModel } from '@/types/chat';

export const AI_MODELS: AIModel[] = [
  // OpenAI Models (Free tier with API credits)
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    supportsStreaming: true,
    description: '🆓 Fast and efficient for most conversations - Free tier available'
  },
  
  // Google Models (Free tier)
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    maxTokens: 1000000,
    supportsStreaming: true,
    description: '🆓 Fast and efficient Gemini model - Free tier'
  },
  
  // Groq Models (Free tier - Super Fast!)
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🆓⚡ Meta Llama 3.1 8B - Ultra fast responses! FREE'
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🆓🚀 Meta Llama 3 8B - Fast and reliable! FREE'
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🆓⚡ Google Gemma 2 9B - Efficient and fast! FREE'
  },
  
  // Cohere Models (Free tier)
  {
    id: 'command',
    name: 'Command',
    provider: 'cohere',
    maxTokens: 4096,
    supportsStreaming: true,
    description: '🆓 Fast and efficient for most conversations - Free tier'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider);
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gemini-1.5-flash';