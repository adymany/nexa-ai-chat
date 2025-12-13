'use client';

import { AIModel } from '@/types/chat';
import { ChevronDown, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ModelSelectorProps {
  models: AIModel[];
  currentModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, currentModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelData = models.find(m => m.id === currentModel);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-500';
      case 'anthropic': return 'bg-orange-500';
      case 'google': return 'bg-blue-500';
      case 'groq': return 'bg-purple-500';
      case 'cohere': return 'bg-pink-500';
      case 'openrouter': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getModelDisplayName = (model: AIModel) => {
    const shortNames: { [key: string]: string } = {
      'gpt-3.5-turbo': 'GPT-3.5',
      'gemini-2.5-flash': 'Gemini 2.5',
      'gemini-1.5-flash': 'Gemini 1.5',
      'llama-3.1-8b-instant': 'Llama 3.1',
      'llama3-8b-8192': 'Llama 3',
      'mixtral-8x7b-32768': 'Mixtral',
      'gemma2-9b-it': 'Gemma 2',
      'command-r7b-12-2024': 'Command R7B'
    };
    return shortNames[model.id] || model.name;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Inline Model Buttons - visible on xl screens and up */}
      <div className="hidden xl:flex items-center gap-1">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleModelSelect(model.id)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${model.id === currentModel
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            title={model.description || model.name}
          >
            <div className={`w-2 h-2 rounded-full ${getProviderColor(model.provider)}`} />
            <span className="whitespace-nowrap">{getModelDisplayName(model)}</span>
            {model.provider === 'groq' && (
              <Zap size={10} className="text-yellow-400" />
            )}
          </button>
        ))}
      </div>

      {/* Dropdown - visible on smaller screens */}
      <div className="relative xl:hidden" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentModelData && (
            <div className={`w-2 h-2 rounded-full ${getProviderColor(currentModelData.provider)}`} />
          )}
          <span className="max-w-[120px] truncate">
            {currentModelData ? getModelDisplayName(currentModelData) : 'Select Model'}
          </span>
          {currentModelData?.provider === 'groq' && (
            <Zap size={12} className="text-yellow-400" />
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1.5 font-medium uppercase tracking-wider">
                Select AI Model
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3 ${model.id === currentModel
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getProviderColor(model.provider)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      {model.provider === 'groq' && (
                        <Zap size={12} className="text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-0.5 truncate">
                      {model.description?.replace(/🆓|⚡/g, '').trim() || model.provider}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
