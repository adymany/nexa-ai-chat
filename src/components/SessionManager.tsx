'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageCircle, Calendar, MoreVertical } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

interface ChatSession {
  id: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

interface SessionManagerProps {
  currentModel: string;
  onSessionChange?: (sessionId: string) => void;
  onNewSession?: () => void;
}

export function SessionManager({ currentModel, onSessionChange, onNewSession }: SessionManagerProps) {
  const { sessionId, chatSessionId, createNewChatSession } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.chatSessions) {
        setSessions(data.chatSessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadSessions();
    }
  }, [sessionId, loadSessions]);

  const handleNewSession = async () => {
    setIsLoading(true);
    try {
      await createNewChatSession(currentModel);
      await loadSessions();
      onNewSession?.();
    } catch (error) {
      console.error('Failed to create new session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    onSessionChange?.(session.id);
    setShowSessionList(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const currentSession = sessions.find(s => s.id === chatSessionId);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSessionList(!showSessionList)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:text-white"
        >
          <MessageCircle size={16} />
          <span>
            {currentSession ? `Session (${formatDate(currentSession.createdAt)})` : 'Select Session'}
          </span>
          <MoreVertical size={14} />
        </button>
        
        <button
          onClick={handleNewSession}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-all duration-200 text-sm text-white disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span>{isLoading ? 'Creating...' : 'New'}</span>
        </button>
      </div>

      {showSessionList && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-medium text-white">Chat Sessions</h3>
            <p className="text-xs text-gray-400">{sessions.length} total sessions</p>
          </div>
          
          <div className="py-2">
            {sessions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <MessageCircle size={24} className="text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No chat sessions yet</p>
                <p className="text-xs text-gray-500 mt-1">Create your first session to get started</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-200 border-l-2 ${
                    session.id === chatSessionId
                      ? 'border-blue-500 bg-gray-700/50'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white truncate">
                          {session.model}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                        {session.messageCount && session.messageCount > 0 && (
                          <span>{session.messageCount} messages</span>
                        )}
                      </div>
                      
                      {session.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {session.lastMessage}
                        </p>
                      )}
                    </div>
                    
                    {session.id === chatSessionId && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      {showSessionList && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSessionList(false)}
        />
      )}
    </div>
  );
}