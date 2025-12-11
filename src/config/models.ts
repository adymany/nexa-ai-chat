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
  
  // OpenRouter Models
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto',
    provider: 'openrouter',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🧠 Smart routing to best available model through OpenRouter'
  },
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    provider: 'openrouter',
    maxTokens: 8192,
    supportsStreaming: true,
    description: '🧠 Mistral 7B Instruct model through OpenRouter'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider);
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gemini-2.5-flash';