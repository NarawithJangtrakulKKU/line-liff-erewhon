import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ปรับ path ถ้าอยู่ต่างจากนี้

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
