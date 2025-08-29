'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && trimmedMessage.length > 0) {
      onSendMessage(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-3 lg:p-4">
      <div className="max-w-4xl mx-auto px-4 lg:px-0">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              style={{ 
                width: '100%',
                minHeight: '48px',
                maxHeight: '128px',
                padding: '12px 48px 12px 14px',
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#ffffff',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '12px',
                resize: 'none',
                outline: 'none',
                overflow: 'auto',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#4b5563';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4b5563';
                e.target.style.backgroundColor = '#374151';
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={disabled || !message.trim()}
              className="absolute right-2 bottom-2 p-2 lg:p-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 rounded-lg lg:rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              title="Send message (Enter)"
            >
              {disabled ? <Square size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 lg:mt-3 text-xs gap-2 sm:gap-0">
          <span className="text-gray-400 font-medium">Press Enter to send, Shift+Enter for new line</span>
          <span className="text-gray-500">{message.length} characters</span>
        </div>
      </div>
    </div>
  );
}