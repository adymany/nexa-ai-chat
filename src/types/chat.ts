export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type AIModel = {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'cohere';
  maxTokens: number;
  supportsStreaming: boolean;
  description: string;
}

export interface ChatRequest {
  messages: Message[];
  model: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: Message;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}