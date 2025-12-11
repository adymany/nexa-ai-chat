import type { Metadata } from "next";
import { SessionProvider } from '@/contexts/SessionContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { MadeByCredit } from '@/components/MadeByCredit';
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexa AI Chat - Multi-Model AI Chatbot",
  description: "Chat with multiple AI models including GPT-4, Claude, and Gemini in one interface. Made by Adnan Tabrezi.",
  keywords: ["AI", "chatbot", "GPT-4", "Claude", "Gemini", "OpenAI", "Anthropic", "Google"],
  authors: [{ name: "Adnan Tabrezi" }],
  creator: "Adnan Tabrezi",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <SessionProvider>
            {children}
            <MadeByCredit />
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}