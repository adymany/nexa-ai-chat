import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingAdmin = await (prisma.user as any).findFirst({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        success: true,
      });
    }

    // Create admin user with hashed password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('123456', saltRounds);

    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
      },
    });

    return NextResponse.json({
      message: 'Admin test user created successfully',
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
      },
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}