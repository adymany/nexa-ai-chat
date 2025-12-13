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

  // Load messages for a specific session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages) {
          const formattedMessages: Message[] = data.messages.map((msg: unknown) => {
            const message = msg as {
              id: string;
              role: string;
              content: string;
              createdAt: string;
              chatSession?: { model: string };
            };
            return {
              id: message.id,
              role: message.role.toLowerCase() as 'user' | 'assistant' | 'system',
              content: message.content,
              timestamp: new Date(message.createdAt),
              model: message.chatSession?.model,
            };
          });
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, sessionId?: string | null) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Message cannot be empty');
      return;
    }

    const userMessage = createUserMessage(trimmedContent);

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const request: ChatRequest = {
        messages: [...messages, userMessage].filter(msg => msg.content && msg.content.trim().length > 0),
        model: currentModel,
        stream: false,
        chatSessionId: sessionId || undefined,
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
        const assistantMessage = createAssistantMessage('', currentModel);
        setMessages(prev => [...prev, assistantMessage]);

        try {
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
                } catch {
                  // Ignore parsing errors
                }
              }
            }
          }
        } catch (streamError) {
          // Handle streaming errors
          let errorMessage = streamError instanceof Error ? streamError.message : 'Streaming error occurred';

          // Check if this is a quota exhausted error
          if (errorMessage.includes('quota') || errorMessage.includes('rate limit') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
            errorMessage = 'Quota exhausted for this model. Please try again later or switch to a different model.';
          }
          // Check if this is a model availability error
          else if (errorMessage.includes('not available') || errorMessage.includes('not supported') ||
            errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
            errorMessage = 'This model is not currently available. Please try a different model from the model selector.';
          }

          setError(errorMessage);
          // Remove the failed assistant message
          setMessages(prev => prev.slice(0, -1));
        }
      } else {
        // Non-streaming response handling
        const data = await response.json();

        // Check if a fallback model was used
        if (data.fallbackUsed) {
          console.info(`Original model failed, fallback to ${data.model} was used.`);
          // Optionally show a notification to the user about the fallback
        }

        const assistantMessage = createAssistantMessage(data.message.content, data.model || currentModel);
        setMessages(prev => [...prev, assistantMessage]);

        // Backup save: Try to save the assistant message from frontend
        // This ensures the message is saved even if backend save failed
        if (sessionId) {
          try {
            await fetch('/api/messages/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatSessionId: sessionId,
                role: 'ASSISTANT',
                content: data.message.content,
              }),
            });
          } catch (saveError) {
            console.error('Backup message save failed:', saveError);
          }
        }
      }
    } catch (err) {
      // Handle different types of errors with user-friendly messages
      let errorMessage = err instanceof Error ? err.message : 'Failed to send message';

      // Check if this is a quota exhausted error
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        errorMessage = 'Quota exhausted for this model. Please try again later or switch to a different model.';
      }
      // Check if this is a model availability error
      else if (errorMessage.includes('not available') || errorMessage.includes('not supported') ||
        errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        errorMessage = 'This model is not currently available. Please try a different model from the model selector.';
      }

      setError(errorMessage);
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
    loadSessionMessages,
  };
}