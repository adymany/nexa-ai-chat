import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      
      // Get user with all their chat sessions
      const user = await getUserById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Return chat sessions with last message preview
      const sessions = user.chatSessions.map(session => ({
        id: session.id,
        sessionName: session.sessionName,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        lastMessage: session.messages[0] || null,
      }));

      return NextResponse.json({ sessions });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Get user sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}