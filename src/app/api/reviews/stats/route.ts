// /api/reviews/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get comprehensive review statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId') // Optional - for user-specific stats

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Basic review stats
    const basicStats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true, isHelpful: true },
      _count: { id: true },
      _sum: { isHelpful: true }
    })

    // Rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
      orderBy: { rating: 'desc' }
    })

    // Reviews with media count
    const reviewsWithMedia = await prisma.review.count({
      where: {
        productId,
        mediaFiles: {
          some: {}
        }
      }
    })

    // Reviews with images vs videos
    const mediaStats = await prisma.reviewMedia.groupBy({
      by: ['mediaType'],
      where: {
        review: { productId }
      },
      _count: { mediaType: true }
    })

    // Most helpful reviews (top 5)
    const topHelpfulReviews = await prisma.review.findMany({
      where: { 
        productId,
        isHelpful: { gt: 0 }
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        mediaFiles: {
          orderBy: { sortOrder: 'asc' },
          take: 3 // Limit media files for performance
        }
      },
      orderBy: { isHelpful: 'desc' },
      take: 5
    })

    // Recent reviews (last 10)
    const recentReviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        mediaFiles: {
          orderBy: { sortOrder: 'asc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Monthly review trend (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::integer as count,
        AVG(rating)::float as average_rating
      FROM "reviews"
      WHERE "productId" = ${productId}
        AND "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as Array<{
      month: Date
      count: number
      average_rating: number
    }>

    // User-specific stats (if userId provided)
    let userStats = null
    if (userId) {
      const userReview = await prisma.review.findFirst({
        where: {
          productId,
          userId
        },
        include: {
          mediaFiles: true
        }
      })

      if (userReview) {
        const userHelpfulVotes = await prisma.reviewHelpful.count({
          where: {
            reviewId: userReview.id,
            isHelpful: true
          }
        })

        userStats = {
          hasReviewed: true,
          review: userReview,
          helpfulVotes: userHelpfulVotes
        }
      } else {
        // Check if user can review (has delivered order with this product)
        const canReview = await prisma.order.findFirst({
          where: {
            userId,
            status: 'DELIVERED',
            orderItems: {
              some: { productId }
            }
          }
        })

        userStats = {
          hasReviewed: false,
          canReview: !!canReview
        }
      }
    }

    // Format rating distribution with percentages
    const totalReviews = basicStats._count.id || 0
    const formattedRatingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingDistribution.find(r => r.rating === rating)
      const count = found?._count.rating || 0
      return {
        rating,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      }
    })

    // Format media stats
    const formattedMediaStats = {
      images: mediaStats.find(m => m.mediaType === 'IMAGE')?._count.mediaType || 0,
      videos: mediaStats.find(m => m.mediaType === 'VIDEO')?._count.mediaType || 0
    }

    return NextResponse.json({
      product: {
        id: productId,
        totalReviews,
        averageRating: Number((basicStats._avg.rating || 0).toFixed(1)),
        totalHelpfulVotes: basicStats._sum.isHelpful || 0
      },
      distribution: formattedRatingDistribution,
      media: {
        reviewsWithMedia,
        totalMediaFiles: formattedMediaStats.images + formattedMediaStats.videos,
        breakdown: formattedMediaStats
      },
      topReviews: topHelpfulReviews,
      recentReviews,
      trend: monthlyTrend.map(item => ({
        month: item.month.toISOString().substring(0, 7), // YYYY-MM format
        count: item.count,
        averageRating: Number((item.average_rating || 0).toFixed(1))
      })),
      userStats
    })

  } catch (error) {
    console.error('Error fetching review statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
}

// GET specific endpoint for admin statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, dateFrom, dateTo, limit = 10 } = body

    const whereClause: any = {}
    
    if (dateFrom && dateTo) {
      whereClause.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    }

    switch (type) {
      case 'top-products':
        // Products with most reviews
        const topProducts = await prisma.product.findMany({
          include: {
            _count: {
              select: { reviews: true }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          orderBy: {
            reviews: {
              _count: 'desc'
            }
          },
          take: limit
        })

        return NextResponse.json({
          topProducts: topProducts.map(product => ({
            id: product.id,
            name: product.name,
            totalReviews: product._count.reviews,
            averageRating: product.reviews.length > 0 
              ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1))
              : 0
          }))
        })

      case 'top-reviewers':
        // Users with most reviews
        const topReviewers = await prisma.user.findMany({
          where: {
            reviews: {
              some: whereClause
            }
          },
          include: {
            _count: {
              select: { reviews: true }
            },
            reviews: {
              where: whereClause,
              select: {
                rating: true,
                isHelpful: true,
                mediaFiles: {
                  select: { id: true }
                }
              }
            }
          },
          orderBy: {
            reviews: {
              _count: 'desc'
            }
          },
          take: limit
        })

        return NextResponse.json({
          topReviewers: topReviewers.map(user => ({
            id: user.id,
            displayName: user.displayName,
            pictureUrl: user.pictureUrl,
            totalReviews: user._count.reviews,
            averageRating: user.reviews.length > 0 
              ? Number((user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length).toFixed(1))
              : 0,
            totalHelpfulVotes: user.reviews.reduce((sum, r) => sum + r.isHelpful, 0),
            totalMediaUploaded: user.reviews.reduce((sum, r) => sum + r.mediaFiles.length, 0)
          }))
        })

      case 'review-trends':
        // Review trends over time
        const trends = await prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('day', "createdAt") as date,
            COUNT(*)::integer as reviews_count,
            AVG(rating)::float as average_rating,
            COUNT(CASE WHEN EXISTS (
              SELECT 1 FROM "review_media" rm WHERE rm."reviewId" = "reviews".id
            ) THEN 1 END)::integer as reviews_with_media
          FROM "reviews"
          WHERE "createdAt" >= ${new Date(dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}
            AND "createdAt" <= ${new Date(dateTo || new Date())}
          GROUP BY DATE_TRUNC('day', "createdAt")
          ORDER BY date ASC
        ` as Array<{
          date: Date
          reviews_count: number
          average_rating: number
          reviews_with_media: number
        }>

        return NextResponse.json({
          trends: trends.map(item => ({
            date: item.date.toISOString().split('T')[0],
            reviewsCount: item.reviews_count,
            averageRating: Number((item.average_rating || 0).toFixed(1)),
            reviewsWithMedia: item.reviews_with_media
          }))
        })

      case 'media-stats':
        // Media upload statistics
        const mediaStats = await prisma.reviewMedia.groupBy({
          by: ['mediaType'],
          where: {
            review: whereClause.createdAt ? {
              createdAt: whereClause.createdAt
            } : {}
          },
          _count: {
            mediaType: true
          },
          _avg: {
            fileSize: true
          },
          _sum: {
            fileSize: true
          }
        })

        const totalMediaFiles = await prisma.reviewMedia.count({
          where: {
            review: whereClause.createdAt ? {
              createdAt: whereClause.createdAt
            } : {}
          }
        })

        return NextResponse.json({
          mediaStats: {
            total: totalMediaFiles,
            breakdown: mediaStats.map(stat => ({
              type: stat.mediaType,
              count: stat._count.mediaType,
              averageSize: Math.round(stat._avg.fileSize || 0),
              totalSize: stat._sum.fileSize || 0
            }))
          }
        })

      case 'rating-analysis':
        // Detailed rating analysis
        const ratingAnalysis = await prisma.review.groupBy({
          by: ['rating'],
          where: whereClause,
          _count: {
            rating: true
          },
          _avg: {
            isHelpful: true
          }
        })

        const totalRatings = ratingAnalysis.reduce((sum, r) => sum + r._count.rating, 0)

        return NextResponse.json({
          ratingAnalysis: {
            total: totalRatings,
            distribution: ratingAnalysis.map(rating => ({
              stars: rating.rating,
              count: rating._count.rating,
              percentage: totalRatings > 0 ? Math.round((rating._count.rating / totalRatings) * 100) : 0,
              averageHelpfulness: Number((rating._avg.isHelpful || 0).toFixed(1))
            })).sort((a, b) => b.stars - a.stars)
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid statistics type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error fetching admin statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}