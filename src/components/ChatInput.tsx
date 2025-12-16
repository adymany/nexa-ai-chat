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

  // Log rendering to debug hydration/render issues
  console.log('ChatInput: Rendering', { disabled, messageLength: message?.length });

  const handleSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    console.log('ChatInput: handleSubmit called', { message, disabled });
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
      handleSubmit(e);
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Detect if pasted content looks like code
  const detectCodeLanguage = (text: string): string | null => {
    const lines = text.split('\n');
    const hasMultipleLines = lines.length > 1;

    // Common code patterns
    const patterns = {
      javascript: [
        /\b(const|let|var|function|=>|async|await|import|export|require)\b/,
        /console\.(log|error|warn)/,
        /\{[\s\S]*\}/,
      ],
      typescript: [
        /:\s*(string|number|boolean|any|void|never)\b/,
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
      ],
      python: [
        /\bdef\s+\w+\s*\(/,
        /\bimport\s+\w+/,
        /\bfrom\s+\w+\s+import/,
        /:\s*\n\s+(if|for|while|def|class)/,
      ],
      java: [
        /public\s+(class|static|void)/,
        /System\.out\.print/,
        /private\s+\w+\s+\w+;/,
      ],
      cpp: [
        /#include\s*[<"]/,
        /std::/,
        /int\s+main\s*\(/,
      ],
      html: [
        /<\/?[a-z]+[^>]*>/i,
        /<!DOCTYPE/i,
      ],
      css: [
        /[.#][\w-]+\s*\{/,
        /:\s*(flex|grid|block|none|absolute|relative);/,
      ],
      sql: [
        /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i,
      ],
      json: [
        /^\s*[\[{]/,
        /"\w+"\s*:/,
      ],
    };

    // Check for each language
    for (const [lang, langPatterns] of Object.entries(patterns)) {
      for (const pattern of langPatterns) {
        if (pattern.test(text)) {
          return lang;
        }
      }
    }

    // Generic code detection - check for code-like characteristics
    const codeIndicators = [
      /[{}\[\]();]/, // brackets and semicolons
      /^\s{2,}|\t/m, // indentation with spaces or tabs
      /\/\/|\/\*|\*\/|#.*$/, // comments
      /[=<>!]+/, // operators
      /\b(if|else|for|while|return|class|function|def|import|from)\b/, // keywords
    ];

    let codeScore = 0;
    for (const indicator of codeIndicators) {
      if (indicator.test(text)) codeScore++;
    }

    // If it looks like code (2+ indicators and multiple lines), mark as generic code
    if (codeScore >= 2 && hasMultipleLines) {
      return 'text'; // generic code block
    }

    return null;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');

    // Skip if it's already markdown formatted
    if (pastedText.includes('```')) {
      return; // Let default paste happen
    }

    const detectedLang = detectCodeLanguage(pastedText);

    if (detectedLang) {
      e.preventDefault();

      // Wrap pasted code in markdown code fence
      const langTag = detectedLang === 'text' ? '' : detectedLang;
      const wrappedCode = `\`\`\`${langTag}\n${pastedText}\n\`\`\``;

      // Insert at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.slice(0, start) + wrappedCode + message.slice(end);
        setMessage(newMessage);

        // Update textarea height
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
          }
        }, 0);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-0">
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full p-4 pr-14 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-[15px] leading-relaxed"
          style={{
            minHeight: '52px',
            maxHeight: '150px',
          }}
        />
        <div
          role="button"
          tabIndex={disabled || !message.trim() ? -1 : 0}
          onClick={handleSubmit}
          onKeyDown={handleButtonKeyDown}
          className={`absolute right-3 bottom-3 p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 flex items-center justify-center ${disabled || !message.trim()
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed pointer-events-none'
            : 'cursor-pointer'
            }`}
          title="Send message (Enter)"
        >
          {disabled ? <Square size={18} /> : <Send size={18} />}
        </div>
      </div>
      {/* Help text - visible on mobile only */}
      <div className="flex items-center justify-center mt-2 text-xs text-gray-600 sm:hidden">
        <span>Press Enter to send • Shift+Enter for new line</span>
      </div>
    </div>
  );
}