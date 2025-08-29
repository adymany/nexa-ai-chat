'use client';

import { useChat, useModels } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { SessionSidebar } from './SessionSidebar';
import { Trash2, RefreshCw, AlertCircle, Bot, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function ChatInterface() {
  const { models, loading: modelsLoading, error: modelsError } = useModels();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

      // Create a meaningful session name from the first message
      let sessionName = 'New Chat';
      if (firstMessage) {
        // Take first 50 characters and clean it up
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
    setIsMobileSidebarOpen(false); // Close mobile sidebar when session is selected
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    clearMessages();
    setIsMobileSidebarOpen(false); // Close mobile sidebar when creating new session
  };

  const handleSessionDeleted = () => {
    // Optionally refresh session list or perform other cleanup
    // The SessionSidebar already handles local state updates
  };

  const handleSendMessage = async (message: string) => {
    let sessionId = currentSessionId;
    
    // Auto-create session if none exists, using the message as session name
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bot size={28} className="text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Welcome to Nexa AI Chat</h3>
          <p className="text-gray-400 mb-6 text-lg leading-relaxed">
            {modelsError 
              ? 'Unable to load AI models. Please check your configuration.' 
              : 'No API keys configured yet. Add your API keys in the Vercel dashboard to enable AI models.'}
          </p>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <p className="text-sm text-gray-300 mb-4 font-medium">
              🔑 Add API Keys in Vercel:
            </p>
            <div className="text-left space-y-2 text-sm text-gray-400">
              <p>• Go to your Vercel project dashboard</p>
              <p>• Click Settings → Environment Variables</p>
              <p>• Add any of these keys to enable models:</p>
              <div className="ml-4 mt-2 space-y-1 text-xs">
                <p>- GOOGLE_GENERATIVE_AI_API_KEY (for Gemini)</p>
                <p>- GROQ_API_KEY (for Llama models)</p>
                <p>- COHERE_API_KEY (for Command)</p>
                <p>- OPENAI_API_KEY (for GPT-3.5)</p>
                <p>- ANTHROPIC_API_KEY (for Claude)</p>
              </div>
              <p className="mt-3">• Redeploy after adding keys</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Session Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        w-80 lg:w-80
      `}>
        <SessionSidebar 
          currentSessionId={currentSessionId || undefined}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          onSessionDeleted={handleSessionDeleted}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800/90 backdrop-blur-md p-3 lg:p-4 shadow-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>
                
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Bot size={16} className="text-white lg:hidden" />
                  <Bot size={20} className="text-white hidden lg:block" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg lg:text-xl font-semibold text-white truncate">
                    Nexa AI Chat
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-400 truncate">
                    <span className="hidden sm:inline">Free multi-model AI chatbot with {models.length} free models • </span>
                    Made by <span className="text-blue-400 font-medium">Adnan Tabrezi</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={retryLastMessage}
                      disabled={isLoading}
                      className="p-2.5 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50"
                      title="Retry last message"
                    >
                      <RefreshCw size={16} className="sm:hidden" />
                      <RefreshCw size={18} className="hidden sm:block" />
                    </button>
                    
                    <button
                      onClick={clearMessages}
                      disabled={isLoading}
                      className="p-2.5 sm:p-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50"
                      title="Clear conversation"
                    >
                      <Trash2 size={16} className="sm:hidden" />
                      <Trash2 size={18} className="hidden sm:block" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Model Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xs lg:text-sm text-gray-400 font-medium whitespace-nowrap">Select Model:</span>
              <div className="overflow-x-auto">
                <ModelSelector
                  models={models}
                  currentModel={currentModel}
                  onModelChange={switchModel}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4 py-8">
              <div className="text-center max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Bot size={20} className="text-white sm:hidden" />
                  <Bot size={28} className="text-white hidden sm:block" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4">
                  Welcome to Nexa AI Chat
                </h2>
                <p className="text-gray-400 mb-2 text-base sm:text-lg md:text-xl leading-relaxed">
                  Start a conversation with our free AI models. All models below are available on free tiers!
                </p>
                <p className="text-sm sm:text-base text-blue-400 mb-4 sm:mb-6 font-medium">
                  🚀 Crafted with passion by Adnan Tabrezi
                </p>
                <div className="bg-gray-800 rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-700">
                  <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 font-medium">
                    🆓 Free Tier Models ({models.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {models.slice(0, 6).map((model) => (
                      <div key={model.id} className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-700 rounded-xl">
                        <span className="text-xs sm:text-sm font-medium text-white truncate pr-2">{model.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
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
            <div className="max-w-4xl mx-auto px-4 lg:px-0">
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
          <div className="border-t border-gray-700 bg-red-900/20 p-3 sm:p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3 text-red-400 px-4 sm:px-0">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium break-words">{error}</span>
            </div>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={`Message ${models.find(m => m.id === currentModel)?.name || 'AI'}...`}
        />
      </div>
    </div>
  );
}