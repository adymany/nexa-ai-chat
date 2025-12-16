'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
    language?: string;
    children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Detect language from common patterns if not provided
    const detectLanguage = (code: string): string => {
        if (language && language !== 'text') return language;

        // Simple language detection based on patterns
        if (code.includes('def ') && code.includes(':')) return 'python';
        if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
        if (code.includes('import React') || code.includes('useState')) return 'tsx';
        if (code.includes('<html') || code.includes('<!DOCTYPE')) return 'html';
        if (code.includes('SELECT ') || code.includes('INSERT ')) return 'sql';
        if (code.includes('#include')) return 'cpp';
        if (code.includes('public class') || code.includes('public static void')) return 'java';
        if (code.includes('package main')) return 'go';
        if (code.includes('fn main')) return 'rust';

        return language || 'text';
    };

    const detectedLanguage = detectLanguage(children);

    return (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-700/50 bg-[#1a1a1a]">
            {/* Header with language badge and copy button */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-gray-700/50">
                <span className="text-xs font-medium text-gray-400 tracking-wide">
                    {detectedLanguage}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-700/50"
                        title="Copy code"
                    >
                        {copied ? (
                            <Check size={14} className="text-green-400" />
                        ) : (
                            <Copy size={14} />
                        )}
                    </button>
                </div>
            </div>

            {/* Code content */}
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={detectedLanguage}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: '1rem 1.25rem',
                        background: '#1a1a1a',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                    }}
                    showLineNumbers={false}
                    wrapLines={false}
                    codeTagProps={{
                        style: {
                            background: 'transparent',
                        }
                    }}
                    PreTag={({ children, ...props }) => (
                        <pre {...props} style={{ ...props.style, background: 'transparent' }}>
                            {children}
                        </pre>
                    )}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
