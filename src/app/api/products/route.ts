import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, isActive: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error('Error fetching all products:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
