import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent reviews with user and product information
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: {
              select: {
                imageUrl: true
              },
              take: 1
            }
          }
        },
        mediaFiles: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Transform the data
    const recentReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt.toISOString(),
      user: {
        displayName: review.user.displayName || 'Anonymous User',
        pictureUrl: review.user.pictureUrl
      },
      product: {
        id: review.product.id,
        name: review.product.name,
        image: review.product.images[0]?.imageUrl
      },
      isVerified: review.isVerified,
      isHelpful: review.isHelpful,
      hasMedia: review.mediaFiles.length > 0
    }))

    return NextResponse.json({
      reviews: recentReviews
    })

  } catch (error) {
    console.error('Error fetching recent reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent reviews' },
      { status: 500 }
    )
  }
} 