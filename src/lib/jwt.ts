// lib/jwt.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: string;
  lineUserId: string;
  displayName: string | null;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// ฟังก์ชันสร้าง JWT Token
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    payload,
    jwtSecret,
    {
      expiresIn: '7d',
      issuer: 'erewhon-shop',
      audience: 'erewhon-users'
    }
  );
}

// ฟังก์ชัน verify JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'erewhon-shop',
      audience: 'erewhon-users'
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// ฟังก์ชันดึง token จาก request
export function getTokenFromRequest(request: NextRequest): string | null {
  // ลองดึงจาก cookie ก่อน
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // ถ้าไม่มีใน cookie ลองดึงจาก Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

// ฟังก์ชันดึงข้อมูล user จาก request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}