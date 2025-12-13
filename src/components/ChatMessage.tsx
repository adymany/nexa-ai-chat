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
    <div className={`flex gap-3 lg:gap-4 p-4 lg:p-6 transition-all duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'
      }`}>
      <div className="flex-shrink-0">
        <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-600 text-white'
          }`}>
          {isUser ? <User size={14} className="lg:hidden" /> : <Bot size={14} className="lg:hidden" />}
          {isUser ? <User size={16} className="hidden lg:block" /> : <Bot size={16} className="hidden lg:block" />}
        </div>
      </div>

      <div className={`flex-1 space-y-2 min-w-0 max-w-[92%] lg:max-w-[95%] ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
        }`}>
        <div className={`flex items-center gap-2 lg:gap-3 flex-wrap ${isUser ? 'flex-row-reverse' : 'flex-row'
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

        <div className="inline-block max-w-[85%]">
          <div className={`leading-relaxed p-3 lg:p-4 rounded-2xl shadow-sm ${isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-700 text-white rounded-bl-md'
            } ${isLoading ? 'animate-pulse' : ''
            }`}
            style={{
              fontSize: '15px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
            {isUser ? (
              // User messages are plain text
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              // Assistant messages render markdown with code blocks
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className="bg-gray-600 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300"
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
                      return <p className="mb-3 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="text-gray-200">{children}</li>;
                    },
                    h1({ children }) {
                      return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-white">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0 text-white">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-base font-bold mb-2 mt-2 first:mt-0 text-white">{children}</h3>;
                    },
                    strong({ children }) {
                      return <strong className="font-bold text-white">{children}</strong>;
                    },
                    em({ children }) {
                      return <em className="italic text-gray-300">{children}</em>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 my-3 italic text-gray-300">
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
                      return <hr className="border-gray-600 my-4" />;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3">
                          <table className="min-w-full border-collapse border border-gray-600">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-gray-600 px-3 py-2 bg-gray-600 font-bold text-left">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-gray-600 px-3 py-2">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
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