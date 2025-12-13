'use client';

import { useChat, useModels } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import dynamic from 'next/dynamic';

const ChatInput = dynamic(() => import('./ChatInput').then(mod => mod.ChatInput), { ssr: false });
import { SessionSidebar } from './SessionSidebar';
import { Trash2, RefreshCw, AlertCircle, Menu, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import NexaIcon from '@/app/Nexa-icon.png';

export function ChatInterface() {
  const { models, loading: modelsLoading, error: modelsError } = useModels();
  const { user, logout } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // Single unified sidebar state - true = open, false = closed
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentModel,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    switchModel,
    retryLastMessage,
    loadSessionMessages,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved sidebar state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_open');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle sidebar and save preference
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebar_open', String(newState));
  };

  // Close sidebar (used by SessionSidebar close button)
  const closeSidebar = () => {
    setSidebarOpen(false);
    localStorage.setItem('sidebar_open', 'false');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load session messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentSessionId, loadSessionMessages]);

  const createNewSession = async (firstMessage?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      let sessionName = 'New Chat';
      if (firstMessage) {
        sessionName = firstMessage.trim().substring(0, 50);
        if (firstMessage.length > 50) {
          sessionName += '...';
        }
      }

      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionName }),
      });

      if (response.ok) {
        const newSession = await response.json();
        setCurrentSessionId(newSession.sessionId);
        return newSession.sessionId;
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
    return null;
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    clearMessages();
    // Close sidebar on mobile after creating new session
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const handleSessionDeleted = () => { };

  const handleSendMessage = async (message: string) => {
    console.log('ChatInterface: handleSendMessage called', { message, currentSessionId });
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession(message);
      if (!sessionId) {
        console.error('Failed to create session');
        return;
      }
    }
    sendMessage(message, sessionId);
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading models...</p>
        </div>
      </div>
    );
  }

  if (modelsError || models.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6">
            <Image src={NexaIcon} alt="Nexa AI" width={64} height={64} className="rounded-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Setup Required</h3>
          <p className="text-gray-400 text-sm">
            Add API keys in your environment to enable AI models.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Backdrop overlay for mobile - clicking closes sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - fixed on mobile, relative on desktop */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto h-full
          bg-gray-800 border-r border-gray-700
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 w-0'}
        `}
      >
        <div className="w-80 h-full">
          <SessionSidebar
            currentSessionId={currentSessionId || undefined}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onSessionDeleted={handleSessionDeleted}
            onClose={closeSidebar}
          />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 flex-shrink-0 z-10">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle - always visible when sidebar is closed */}
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Open sidebar"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Image
                src={NexaIcon}
                alt="Nexa AI"
                width={32}
                height={32}
                className="rounded-lg shadow-lg"
              />
              <span className="text-lg font-semibold text-white hidden sm:block">Nexa AI</span>
            </div>
          </div>

          {/* Center: Model Selector + Actions */}
          <div className="flex items-center gap-2">
            <ModelSelector
              models={models}
              currentModel={currentModel}
              onModelChange={switchModel}
              disabled={isLoading}
            />

            {messages.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 ml-2">
                <button
                  onClick={retryLastMessage}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Retry"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={clearMessages}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Clear"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right: User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {user?.username}
              </span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-gray-400">Free Account</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto relative p-4 pb-32 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg">
                <Image
                  src={NexaIcon}
                  alt="Nexa AI"
                  width={64}
                  height={64}
                  className="rounded-2xl shadow-lg mx-auto mb-6"
                />
                <h2 className="text-2xl font-semibold text-white mb-3">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 mb-6">
                  Choose a model and start chatting. All models are free!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => switchModel(model.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${model.id === currentModel
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-24 left-4 right-4 mx-auto max-w-5xl z-40">
            <div className="bg-red-900/80 backdrop-blur border border-red-700 rounded-xl p-3 flex items-center gap-3 text-red-200 shadow-xl">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Chat Input Area - Fixed at bottom */}
        <div className="fixed bottom-4 sm:bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-30 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={`Message ${models.find(m => m.id === currentModel)?.name || 'AI'}...`}
          />
        </div>
      </div>
    </div>
  );
}