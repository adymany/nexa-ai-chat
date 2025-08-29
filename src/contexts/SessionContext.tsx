'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  sessionId: string;
  chatSessionId: string | null;
  setChatSessionId: (id: string) => void;
  createNewChatSession: (model: string) => Promise<string>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get or create session ID from localStorage
    let storedSessionId = localStorage.getItem('nexa-session-id');
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('nexa-session-id', storedSessionId);
    }
    setSessionId(storedSessionId);
    setIsLoading(false);
  }, []);

  const createNewChatSession = async (model: string): Promise<string> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }

      const data = await response.json();
      setChatSessionId(data.chatSessionId);
      return data.chatSessionId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        chatSessionId,
        setChatSessionId,
        createNewChatSession,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
