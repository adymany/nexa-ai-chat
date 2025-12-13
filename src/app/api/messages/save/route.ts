import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { chatSessionId, role, content } = body;

        if (!chatSessionId || !role || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: chatSessionId, role, content' },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = ['USER', 'ASSISTANT'];
        const normalizedRole = role.toUpperCase();
        if (!validRoles.includes(normalizedRole)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be USER or ASSISTANT' },
                { status: 400 }
            );
        }

        // Check if the session exists
        const session = await prisma.chatSession.findUnique({
            where: { id: chatSessionId }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Chat session not found' },
                { status: 404 }
            );
        }

        // Check if a similar message already exists (to avoid duplicates)
        // Look for messages with same role and similar content in the last minute
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const existingMessage = await prisma.message.findFirst({
            where: {
                chatSessionId,
                role: normalizedRole,
                content: content.substring(0, 100), // Compare first 100 chars for efficiency
                createdAt: { gte: oneMinuteAgo }
            }
        });

        if (existingMessage) {
            // Message already exists, return success without creating duplicate
            return NextResponse.json({
                success: true,
                message: existingMessage,
                duplicate: true
            });
        }

        // Create the message with retry logic
        let message = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !message) {
            try {
                message = await prisma.message.create({
                    data: {
                        chatSessionId,
                        role: normalizedRole,
                        content,
                    }
                });
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    throw error;
                }
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempts)));
            }
        }

        // Update the session's updatedAt timestamp
        await prisma.chatSession.update({
            where: { id: chatSessionId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            message,
            duplicate: false
        });
    } catch (error) {
        console.error('Error saving message:', error);
        return NextResponse.json(
            { error: 'Failed to save message' },
            { status: 500 }
        );
    }
}
