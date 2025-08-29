import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Check if tables exist by trying to count users
    await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database is connected and tables exist',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database setup error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure to run `npx prisma migrate deploy` to create the database tables',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  try {
    // Force database migration (useful for development)
    await prisma.$connect();
    
    // This will create tables if they don't exist
    // In production, you should use proper migrations
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \"users\" (
        \"id\" TEXT NOT NULL PRIMARY KEY,
        \"sessionId\" TEXT NOT NULL UNIQUE,
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \"chat_sessions\" (
        \"id\" TEXT NOT NULL PRIMARY KEY,
        \"userId\" TEXT NOT NULL,
        \"model\" TEXT NOT NULL,
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\"userId\") REFERENCES \"users\"(\"id\") ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \"messages\" (
        \"id\" TEXT NOT NULL PRIMARY KEY,
        \"chatSessionId\" TEXT NOT NULL,
        \"role\" TEXT NOT NULL CHECK (\"role\" IN ('USER', 'ASSISTANT', 'SYSTEM')),
        \"content\" TEXT NOT NULL,
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\"chatSessionId\") REFERENCES \"chat_sessions\"(\"id\") ON DELETE CASCADE
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
