'use client';

import { useChat, useModels } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { Trash2, RefreshCw, AlertCircle, Bot } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ChatInterface() {
  const { models, loading: modelsLoading, error: modelsError } = useModels();
  const {
    messages,
    currentModel,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    switchModel,
    retryLastMessage,
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading models...</p>
        </div>
      </div>
    );
  }

  if (modelsError || models.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Models Available</h3>
          <p className="text-muted-foreground mb-4">
            {modelsError || 'No AI models are configured. Please check your environment variables.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Make sure you have set at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/90 backdrop-blur-md p-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Nexa AI Chat
                </h1>
                <p className="text-sm text-gray-400">
                  Free multi-model AI chatbot with {models.length} free models
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={retryLastMessage}
                    disabled={isLoading}
                    className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50"
                    title="Retry last message"
                  >
                    <RefreshCw size={18} />
                  </button>
                  
                  <button
                    onClick={clearMessages}
                    disabled={isLoading}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50"
                    title="Clear conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Model Tabs */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">Select Model:</span>
            <ModelSelector
              models={models}
              currentModel={currentModel}
              onModelChange={switchModel}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Welcome to Nexa AI Chat
              </h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                Start a conversation with our free AI models. All models below are available on free tiers!
              </p>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <p className="text-sm text-gray-300 mb-4 font-medium">
                  🆓 Free Tier Models ({models.length}):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {models.slice(0, 6).map((model) => (
                    <div key={model.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-xl">
                      <span className="text-sm font-medium text-white">{model.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        model.provider === 'groq' 
                          ? 'bg-purple-600 text-purple-100' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {model.provider}{model.provider === 'groq' ? ' ⚡' : ''}
                      </span>
                    </div>
                  ))}
                  {models.length > 6 && (
                    <p className="text-xs text-gray-500 col-span-full text-center pt-2">
                      and {models.length - 6} more models...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-t border-gray-700 bg-red-900/20 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-red-400">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading}
        placeholder={`Message ${models.find(m => m.id === currentModel)?.name || 'AI'}...`}
      />
    </div>
  );
}