'use client';

import { AIModel } from '@/types/chat';

interface ModelSelectorProps {
  models: AIModel[];
  currentModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, currentModel, onModelChange, disabled = false }: ModelSelectorProps) {
  
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-600';
      case 'anthropic': return 'bg-blue-600';
      case 'google': return 'bg-orange-500';
      case 'groq': return 'bg-purple-600';
      case 'cohere': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const getModelDisplayName = (model: AIModel) => {
    // Shorten long model names for tabs
    const shortNames: { [key: string]: string } = {
      'gpt-3.5-turbo': 'GPT-3.5',
      'gemini-1.5-flash': 'Gemini',
      'llama-3.1-8b-instant': 'Llama 3.1',
      'llama3-8b-8192': 'Llama 3',
      'mixtral-8x7b-32768': 'Mixtral',
      'gemma2-9b-it': 'Gemma 2',
      'command': 'Command'
    };
    return shortNames[model.id] || model.name;
  };

  return (
    <div className="flex flex-wrap gap-1.5 lg:gap-2">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onModelChange(model.id)}
          disabled={disabled}
          className={`relative px-3 py-2.5 lg:px-4 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 lg:gap-2 whitespace-nowrap ${
            model.id === currentModel
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
          title={`${model.name} - ${model.description}`}
        >
          <div className={`w-2 h-2 lg:w-2 lg:h-2 rounded-full ${getProviderColor(model.provider)}`}></div>
          {getModelDisplayName(model)}
          {model.provider === 'groq' && (
            <span className="text-yellow-400 text-xs">⚡</span>
          )}
        </button>
      ))}
    </div>
  );
}
