import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { sessionName } = await request.json();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      
      // Create new chat session with dynamic name
      const chatSession = await prisma.chatSession.create({
        data: {
          userId: decoded.userId,
          sessionName: sessionName || 'New Chat',
        },
        include: {
          messages: true,
        },
      });

      return NextResponse.json({
        sessionId: chatSession.id,
        sessionName: chatSession.sessionName,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}