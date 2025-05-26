import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1 // Get only the first image for each product
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 6 // Limit to 6 featured products
    })

    return NextResponse.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
} 