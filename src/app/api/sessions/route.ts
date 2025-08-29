import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { findOrCreateUser, createChatSession } from '@/lib/database';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, model } = body;

    // Generate session ID if not provided
    const userSessionId = sessionId || uuidv4();

    // Find or create user
    const user = await findOrCreateUser(userSessionId);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create or find user' },
        { status: 500 }
      );
    }

    // Create new chat session
    const chatSession = await createChatSession({
      userId: user.id,
      model: model || 'gemini-1.5-flash',
    });

    return NextResponse.json({
      success: true,
      sessionId: userSessionId,
      chatSessionId: chatSession.id,
      user,
      chatSession,
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const user = await findOrCreateUser(sessionId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform sessions to include message count and last message
    const sessionsWithDetails = await Promise.all(
      (user.chatSessions || []).map(async (session) => {
        const messageCount = await prisma.message.count({
          where: { chatSessionId: session.id },
        });
        
        const lastMessage = session.messages?.[0]; // Most recent message
        
        return {
          id: session.id,
          sessionName: session.sessionName,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messageCount,
          lastMessage: lastMessage 
            ? lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '')
            : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      user,
      chatSessions: sessionsWithDetails,
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}