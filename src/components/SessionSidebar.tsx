'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, AlertTriangle, Edit2, Check, X, Menu } from 'lucide-react';

interface ChatSession {
  id: string;
  sessionName: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: {
    content: string;
    role: string;
    createdAt: string;
  } | null;
}

interface SessionSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDeleted?: () => void;
  onClose?: () => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionDeleted,
  onClose,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { user, logout } = useAuth();

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/user/sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const updateSessionName = async (sessionId: string, newName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/sessions/${sessionId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionName: newName }),
      });

      if (response.ok) {
        // Update the session in local state
        setSessions(prev =>
          prev.map(s =>
            s.id === sessionId
              ? { ...s, sessionName: newName }
              : s
          )
        );
        setEditingSessionId(null);
        setEditingName('');
      } else {
        console.error('Failed to update session name');
      }
    } catch (error) {
      console.error('Failed to update session name:', error);
    }
  };

  const startEditing = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingName('');
  };

  const saveEditing = (sessionId: string) => {
    if (editingName.trim()) {
      updateSessionName(sessionId, editingName.trim());
    } else {
      cancelEditing();
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/sessions/${sessionId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the session from local state
        setSessions(prev => prev.filter(s => s.id !== sessionId));

        // If the deleted session was the current one, clear it
        if (currentSessionId === sessionId) {
          onNewSession();
        }

        // Call the optional callback to refresh parent state
        onSessionDeleted?.();

        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between h-8">
          {/* Sidebar Toggle/Close Button */}
          <button
            onClick={(e) => {
              console.log('SessionSidebar: Close button clicked');
              onClose?.();
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <X size={20} />
          </button>

          <button
            onClick={onNewSession}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>No chat sessions yet.</p>
            <p className="text-sm mt-2">Start a new conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div key={session.id} className="relative group mb-2">
                <button
                  onClick={() => onSessionSelect(session.id)}
                  className={`w-full text-left p-3 sm:p-3.5 rounded-lg transition-colors ${currentSessionId === session.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                    }`}
                >
                  <div className="flex flex-col space-y-1 pr-12">
                    <div className="flex items-center justify-between">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditing(session.id);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          className="flex-1 bg-gray-600 text-white text-sm px-2 py-1 rounded border-none outline-none focus:bg-gray-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="font-medium text-sm truncate pr-2">
                          {truncateText(session.sessionName)}
                        </h3>
                      )}
                      {editingSessionId !== session.id && (
                        <span className="text-xs opacity-75 whitespace-nowrap">
                          {formatDate(session.updatedAt)}
                        </span>
                      )}
                    </div>

                    {session.lastMessage && (
                      <p className="text-xs opacity-75">
                        {truncateText(session.lastMessage.content, 60)}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs opacity-60">
                      <span>{session.messageCount} messages</span>
                    </div>
                  </div>
                </button>

                {/* Edit and Delete Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingSessionId === session.id ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditing(session.id);
                        }}
                        className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white"
                        title="Save"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="p-1.5 rounded bg-gray-600 hover:bg-gray-700 text-white"
                        title="Cancel"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session.id, session.sessionName);
                        }}
                        className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        title="Rename session"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(session.id);
                        }}
                        className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white"
                        title="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-5 max-w-sm w-full mx-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Session</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to delete this chat session? All messages will be permanently removed.
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSession(showDeleteConfirm)}
                disabled={deletingSessionId === showDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deletingSessionId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};