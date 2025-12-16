'use client';

import { Message } from '@/types/chat';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

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
    <div className={`flex gap-3 lg:gap-4 p-4 lg:p-6 transition-all duration-200 ${isUser ? 'flex-row-reverse justify-start' : 'flex-row'
      }`}>
      {/* Only show avatar for user messages */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white">
            <User size={14} className="lg:hidden" />
            <User size={16} className="hidden lg:block" />
          </div>
        </div>
      )}

      <div className={`flex-1 space-y-2 min-w-0 ${isUser ? 'flex flex-col items-end max-w-[80%] lg:max-w-[70%]' : 'flex flex-col items-start'
        }`}>
        {/* Hide header for assistant messages for cleaner look */}
        {isUser && (
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap flex-row-reverse">
            <span className="text-sm font-medium text-white">You</span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className={isUser ? "inline-block" : "w-full"}>
          {isUser ? (
            // User messages in a bubble
            <div
              className="leading-relaxed px-4 py-3 rounded-2xl rounded-br-md bg-gray-700 text-white shadow-sm"
              style={{
                fontSize: '15px',
                lineHeight: '1.6',
                fontWeight: '400'
              }}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ) : (
            // Assistant messages - NO bubble, just plain text
            <div
              className={`text-gray-100 ${isLoading ? 'animate-pulse' : ''}`}
              style={{
                fontSize: '15px',
                lineHeight: '1.75',
                fontWeight: '400'
              }}
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className="bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono border border-emerald-700/50"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock language={match?.[1]}>
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      );
                    },
                    // Style other markdown elements
                    p({ children }) {
                      return <p className="mb-4 last:mb-0 text-gray-200">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-outside ml-5 mb-4 space-y-2">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-outside ml-5 mb-4 space-y-2">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="text-gray-200 pl-1">{children}</li>;
                    },
                    h1({ children }) {
                      return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-white">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0 text-white">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-white">{children}</h3>;
                    },
                    strong({ children }) {
                      return <strong className="font-bold text-white">{children}</strong>;
                    },
                    em({ children }) {
                      return <em className="italic text-gray-300">{children}</em>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-300 bg-gray-800/50 py-2 rounded-r">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    hr() {
                      return <hr className="border-gray-700 my-6" />;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border-collapse border border-gray-700">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-gray-700 px-4 py-2 bg-gray-800 font-bold text-left text-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-gray-700 px-4 py-2 text-gray-200">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {isLoading && (
                <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1 rounded" />
              )}
            </div>
          )}
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