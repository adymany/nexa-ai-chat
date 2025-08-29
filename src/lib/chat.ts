import { ChatRequest, Message, AIModel } from '@/types/chat';

export class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async sendMessage(request: ChatRequest): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMessageStream(request: ChatRequest): Promise<ReadableStream<string>> {
    const response = await this.sendMessage({ ...request, stream: true });
    
    if (!response.body) {
      throw new Error('No response body');
    }

    return new ReadableStream({
      start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      controller.enqueue(content);
                    }
                  }
                } catch {
                  // Ignore parsing errors for incomplete chunks
                }
              }
            }

            return pump();
          });
        }

        return pump();
      },
    });
  }
}

export const chatAPI = new ChatAPI();

// Utility functions
export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const createUserMessage = (content: string): Message => {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Message content cannot be empty');
  }
  return {
    id: generateMessageId(),
    role: 'user',
    content: trimmedContent,
    timestamp: new Date(),
  };
};

export const createAssistantMessage = (content: string, model?: string): Message => {
  const trimmedContent = content.trim();
  return {
    id: generateMessageId(),
    role: 'assistant',
    content: trimmedContent,
    timestamp: new Date(),
    model,
  };
};

export const formatMessageForAPI = (message: Message) => ({
  role: message.role,
  content: message.content,
});

export const estimateTokens = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};