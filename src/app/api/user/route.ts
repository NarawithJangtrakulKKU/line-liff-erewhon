import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // ตรวจสอบว่า user มีในระบบแล้วหรือไม่
    let user = await prisma.user.findUnique({
      where: { lineUserId },
    });

    if (user) {
      // ถ้ามีแล้ว อัปเดตข้อมูล
      user = await prisma.user.update({
        where: { lineUserId },
        data: {
          displayName,
          pictureUrl,
        },
      });
    } else {
      // ถ้าไม่มี สร้างใหม่
      user = await prisma.user.create({
        data: {
          lineUserId,
          displayName,
          pictureUrl,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      where: { lineUserId },
      include: {
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        cartItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
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