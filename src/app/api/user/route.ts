// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get('lineUserId');

    if (!lineUserId) {
      return NextResponse.json(
        { error: 'LINE User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        lineUserId: lineUserId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - สร้างหรืออัปเดต user และสร้าง JWT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId, displayName, pictureUrl } = body;

    if (!lineUserId) {
      return NextResponse.json(
        { error: 'LINE User ID is required' },
        { status: 400 }
      );
    }

    // สร้างหรืออัปเดต user ใน database
    const user = await prisma.user.upsert({
      where: {
        lineUserId: lineUserId,
      },
      update: {
        displayName: displayName,
        pictureUrl: pictureUrl,
        updatedAt: new Date(),
      },
      create: {
        lineUserId: lineUserId,
        displayName: displayName,
        pictureUrl: pictureUrl,
      },
    });

    // สร้าง JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const tokenPayload = {
      userId: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      jwtSecret,
      { 
        expiresIn: '7d', // Token หมดอายุใน 7 วัน
        issuer: 'erewhon-shop',
        audience: 'erewhon-users'
      }
    );

    // สร้าง response และ set cookie
    const response = NextResponse.json({ 
      user,
      token,
      message: 'User authenticated successfully'
    });

    // Set JWT เป็น HTTP-only cookie (ปลอดภัยกว่า localStorage)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 วัน
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}