import { NextRequest, NextResponse } from 'next/server';
import { getMessagesByChatSession } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const messages = await getMessagesByChatSession(sessionId);

    return NextResponse.json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error('Session messages retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve session messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}