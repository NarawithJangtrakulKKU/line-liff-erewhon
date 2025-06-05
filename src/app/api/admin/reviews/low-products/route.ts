import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get products with their review statistics
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true,
            createdAt: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        images: {
          select: {
            imageUrl: true
          },
          take: 1
        }
      },
      where: {
        reviews: {
          some: {} // Only products with reviews
        }
      }
    })

    // Calculate rating statistics for each product
    const productsWithStats = products.map(product => {
      const ratings = product.reviews.map(r => r.rating)
      const totalReviews = ratings.length
      const averageRating = totalReviews > 0 ? ratings.reduce((a, b) => a + b, 0) / totalReviews : 0
      const fiveStarCount = ratings.filter(r => r === 5).length
      const oneStarCount = ratings.filter(r => r === 1).length

      // Calculate recent trend (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentRatings = product.reviews
        .filter(r => r.createdAt >= thirtyDaysAgo)
        .map(r => r.rating)
      const previousRatings = product.reviews
        .filter(r => r.createdAt >= sixtyDaysAgo && r.createdAt < thirtyDaysAgo)
        .map(r => r.rating)

      const recentAvg = recentRatings.length > 0 ? recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length : averageRating
      const previousAvg = previousRatings.length > 0 ? previousRatings.reduce((a, b) => a + b, 0) / previousRatings.length : averageRating

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (recentAvg > previousAvg + 0.2) trend = 'up'
      else if (recentAvg < previousAvg - 0.2) trend = 'down'

      return {
        productId: product.id,
        productName: product.name,
        image: product.images[0]?.imageUrl,
        averageRating,
        totalReviews,
        fiveStarCount,
        oneStarCount,
        recentRating: recentAvg,
        trend,
        category: product.category.name
      }
    })

    // Sort by average rating and get low-rated products
    const lowRatedProducts = productsWithStats
      .filter(p => p.averageRating < 3.5 && p.totalReviews >= 3) // Products with poor ratings and enough reviews
      .sort((a, b) => a.averageRating - b.averageRating) // Lowest rating first
      .slice(0, limit)

    return NextResponse.json({
      products: lowRatedProducts
    })

  } catch (error) {
    console.error('Error fetching low-rated products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch low-rated products' },
      { status: 500 }
    )
  }
} 