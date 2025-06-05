import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range based on period
    let daysBack = 30
    switch (period) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    // Get reviews within the time period
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        rating: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group reviews by time periods
    const trends = []
    const daysPerPeriod = Math.max(1, Math.floor(daysBack / 10)) // Divide into 10 periods max

    for (let i = 0; i < daysBack; i += daysPerPeriod) {
      const periodStart = new Date(startDate)
      periodStart.setDate(periodStart.getDate() + i)
      const periodEnd = new Date(periodStart)
      periodEnd.setDate(periodEnd.getDate() + daysPerPeriod)

      const periodReviews = reviews.filter(r => 
        r.createdAt >= periodStart && r.createdAt < periodEnd
      )

      const excellent = periodReviews.filter(r => r.rating === 5).length
      const good = periodReviews.filter(r => r.rating === 4).length
      const average = periodReviews.filter(r => r.rating === 3).length
      const poor = periodReviews.filter(r => r.rating === 2).length
      const terrible = periodReviews.filter(r => r.rating === 1).length

      trends.push({
        period: periodStart.toLocaleDateString('th-TH', { 
          month: 'short', 
          day: 'numeric' 
        }),
        excellent,
        good,
        average,
        poor,
        terrible
      })
    }

    return NextResponse.json({
      trends,
      period,
      totalDataPoints: trends.length
    })

  } catch (error) {
    console.error('Error fetching review trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review trends' },
      { status: 500 }
    )
  }
} 