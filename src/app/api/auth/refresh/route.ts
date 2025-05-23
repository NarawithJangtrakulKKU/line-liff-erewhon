// app/api/auth/refresh/route.ts
import { createToken, getUserFromRequest } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลล่าสุดจาก database
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.userId,
      },
    });

    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // สร้าง token ใหม่
    const newToken = createToken({
      userId: dbUser.id,
      lineUserId: dbUser.lineUserId,
      displayName: dbUser.displayName,
      role: dbUser.role,
    });

    const response = NextResponse.json({
      user: dbUser,
      token: newToken,
      message: 'Token refreshed successfully'
    });

    // Set cookie ใหม่
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 วัน
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}