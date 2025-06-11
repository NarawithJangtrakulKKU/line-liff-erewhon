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
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 6 // Limit to 6 featured products
    })

    // Calculate averageRating for each product
    const productsWithRating = products.map(product => {
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      const { reviews, _count, ...productData } = product;
      
      return {
        ...productData,
        averageRating: averageRating,
        reviewCount: _count.reviews
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithRating
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
} 