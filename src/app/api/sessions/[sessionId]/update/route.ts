import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { sessionId } = await params;
    const { sessionName } = await request.json();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      
      // Verify that the session belongs to the authenticated user
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: decoded.userId,
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found or access denied' },
          { status: 404 }
        );
      }

      // Update the session name
      const updatedSession = await prisma.chatSession.update({
        where: {
          id: sessionId,
        },
        data: {
          sessionName: sessionName,
        },
      });

      return NextResponse.json({
        success: true,
        sessionName: updatedSession.sessionName,
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Update session name error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}