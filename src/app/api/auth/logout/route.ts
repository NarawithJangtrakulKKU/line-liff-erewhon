import { NextRequest, NextResponse } from 'next/server';

// app/api/auth/logout/route.ts
export async function POST(request: NextRequest) {
    try {
      const response = NextResponse.json({
        message: 'Logged out successfully'
      });
  
      // ลบ auth token cookie
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // ทำให้ cookie หมดอายุทันที
        path: '/',
      });
  
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: 500 }
      );
    }
  }