'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, AIModel, ChatRequest } from '@/types/chat';
import { chatAPI, createUserMessage, createAssistantMessage } from '@/lib/chat';
import { DEFAULT_MODEL } from '@/config/models';

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const availableModels = await chatAPI.getAvailableModels();
        setModels(availableModels);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  const refetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const availableModels = await chatAPI.getAvailableModels();
      setModels(availableModels);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setLoading(false);
    }
  }, []);

  return { models, loading, error, refetch: refetchModels };
}

export function useChat(initialModel: string = DEFAULT_MODEL) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState(initialModel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, options?: { model?: string }) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Message cannot be empty');
      return;
    }

    const model = options?.model || currentModel;
    const userMessage = createUserMessage(trimmedContent);
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const request: ChatRequest = {
        messages: [...messages, userMessage].filter(msg => msg.content && msg.content.trim().length > 0),
        model,
        stream: false,
      };

      const response = await chatAPI.sendMessage(request);
      
      if (request.stream) {
        // Streaming response handling
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        
        // Create assistant message placeholder
        const assistantMessage = createAssistantMessage('', model);
        setMessages(prev => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'text-delta') {
                  assistantContent += parsed.textDelta;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      } else {
        // Non-streaming response handling
        const data = await response.json();
        const assistantMessage = createAssistantMessage(data.message.content, model);
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the failed assistant message if no content was received
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentModel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const switchModel = useCallback((modelId: string) => {
    setCurrentModel(modelId);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (!lastUserMessage) return;

    // Remove assistant messages after the last user message
    const lastUserIndex = messages.findLastIndex(msg => msg.id === lastUserMessage.id);
    setMessages(messages.slice(0, lastUserIndex + 1));
    
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    currentModel,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    switchModel,
    retryLastMessage,
  };
}