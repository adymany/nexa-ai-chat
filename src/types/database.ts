export interface User {
  id: string;
  username: string;
  passwordHash: string;
  sessionId?: string;
  createdAt: Date;
  lastActive: Date;
  preferences?: unknown;
}

export interface ChatSession {
  id: string;
  userId: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatSessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: Date;
}

export interface CreateUserData {
  username: string;
  passwordHash: string;
  sessionId?: string;
}

export interface CreateChatSessionData {
  userId: string;
  model: string;
}

export interface CreateMessageData {
  chatSessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
}

// Authentication types
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  sessionId?: string;
}