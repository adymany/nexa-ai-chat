'use client';

import { Message } from '@/types/chat';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`flex gap-4 p-6 transition-all duration-200 ${
      isUser ? 'flex-row-reverse' : 'flex-row'
    }`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
      </div>
      
      <div className={`flex-1 space-y-2 min-w-0 max-w-[70%] ${
        isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
      }`}>
        <div className={`flex items-center gap-3 flex-wrap ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <span className="text-sm font-medium text-white">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.model && (
            <span className="text-xs text-gray-400 font-medium">
              {message.model}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="max-w-none">
          <div className={`whitespace-pre-wrap leading-relaxed p-4 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-gray-700 text-white rounded-bl-md'
          } ${
            isLoading ? 'animate-pulse' : ''
          }`}
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
            {message.content}
            {isLoading && (
              <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1 rounded" />
            )}
          </div>
        </div>
        
        {isAssistant && message.content && (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-300 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
              title="Copy message"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
            {copied && (
              <span className="text-xs text-green-400 font-medium animate-fade-in">
                Copied!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}