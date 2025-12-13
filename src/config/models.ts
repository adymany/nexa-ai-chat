import { AIModel } from '@/types/chat';

export const AI_MODELS: AIModel[] = [
  // Google Models (Free tier)
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
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
    id: 'llama3-groq-8b-8192-tool-use-preview',
    name: 'Llama 3 Groq 8B Tool Use',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🆓⚡ Llama 3 Groq 8B with tool use capabilities - Free tier'
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
    id: 'command-r7b-12-2024',
    name: 'Command R7B (Dec 2024)',
    provider: 'cohere',
    maxTokens: 128000,
    supportsStreaming: true,
    description: '🆓 Advanced Cohere model with improved reasoning - Free tier'
  },

  // OpenRouter Models (Free tier)
  {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Exp',
    provider: 'openrouter',
    maxTokens: 1000000,
    supportsStreaming: true,
    description: '🆓 Google Gemini 2.0 Flash Experimental - FREE via OpenRouter'
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'openrouter',
    maxTokens: 128000,
    supportsStreaming: true,
    description: '🆓 Meta Llama 4 Maverick - Latest Llama model - FREE'
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek V3',
    provider: 'openrouter',
    maxTokens: 64000,
    supportsStreaming: true,
    description: '🆓 DeepSeek V3 - Advanced reasoning and coding - FREE'
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct',
    name: 'Mistral Small 3.1 24B',
    provider: 'openrouter',
    maxTokens: 96000,
    supportsStreaming: true,
    description: '🆓 Mistral Small 3.1 24B - Efficient and powerful - FREE'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider);
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'deepseek/deepseek-chat-v3-0324';