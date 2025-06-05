import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get total review count
    const totalReviews = await prisma.review.count()

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    })

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      _count: {
        rating: true
      }
    })

    // Convert to object format
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    // Get recent reviews count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentReviews = await prisma.review.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get verified reviews count
    const verifiedReviews = await prisma.review.count({
      where: {
        isVerified: true
      }
    })

    return NextResponse.json({
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: distribution,
      recentReviews,
      verifiedReviews
    })

  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
} 