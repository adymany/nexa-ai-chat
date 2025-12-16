import { prisma } from './prisma';
import { CreateUserData, CreateChatSessionData, CreateMessageData } from '@/types/database';

// User operations
export async function createUser(data: CreateUserData) {
  try {
    const createData: {
      username: string;
      passwordHash: string;
      sessionId?: string;
    } = {
      username: data.username,
      passwordHash: data.passwordHash,
    };

    if (data.sessionId) {
      createData.sessionId = data.sessionId;
    }

    return await prisma.user.create({
      data: createData,
    });
  } catch (error) {
    // If user already exists, fetch and return existing user
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      if (data.sessionId) {
        return await prisma.user.findUnique({
          where: { sessionId: data.sessionId },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (prisma.user as any).findFirst({
          where: { username: data.username },
        });
      }
    }
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (prisma.user as any).findFirst({
    where: { username },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      chatSessions: {
        orderBy: { updatedAt: 'desc' },
        take: 50, // Limit to most recent 50 sessions
        select: {
          id: true,
          sessionName: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              content: true,
              role: true,
              createdAt: true,
            }
          },
        },
      },
    },
  });
}

export async function getUserBySessionId(sessionId: string) {
  return await prisma.user.findUnique({
    where: { sessionId },
    include: {
      chatSessions: {
        orderBy: { updatedAt: 'desc' }, // Most recent sessions first
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Only get the last message for preview
          },
        },
      },
    },
  });
}

// Legacy function - no longer used after authentication implementation
// This function is kept for potential migration purposes but not actively used
export async function findOrCreateUser(sessionId: string) {
  try {
    // Just try to find existing user, don't create new ones without proper auth
    const user = await getUserBySessionId(sessionId);
    return user;
  } catch (error) {
    console.error('Error finding user by session ID:', error);
    return null;
  }
}

// Chat session operations
export async function createChatSession(data: CreateChatSessionData) {
  return await prisma.chatSession.create({
    data,
    include: {
      messages: true,
    },
  });
}

export async function getChatSession(sessionId: string) {
  return await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      user: true,
    },
  });
}

// Legacy function - model field moved to individual messages
// This function is deprecated as sessions no longer have a model field
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateChatSessionModel(sessionId: string, model: string) {
  console.warn('updateChatSessionModel is deprecated - model field moved to messages');
  // Return the session without updating model field since it no longer exists
  return await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
}

// Message operations
export async function createMessage(data: CreateMessageData) {
  return await prisma.message.create({
    data,
  });
}

export async function getMessagesByChatSession(chatSessionId: string) {
  return await prisma.message.findMany({
    where: { chatSessionId },
    orderBy: { createdAt: 'asc' },
    include: {
      chatSession: {
        select: {
          sessionName: true,
        },
      },
    },
  });
}

export async function getChatSessionWithMessageCount(sessionId: string) {
  return await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      user: true,
    },
  });
}

export async function deleteOldSessions(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await prisma.chatSession.deleteMany({
    where: {
      updatedAt: {
        lt: cutoffDate,
      },
    },
  });
}