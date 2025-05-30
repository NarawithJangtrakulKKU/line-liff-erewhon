import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, checks } = body

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!checks || !Array.isArray(checks) || checks.length === 0) {
      return NextResponse.json(
        { message: 'Checks array is required' },
        { status: 400 }
      )
    }

    // Validate each check object
    for (const check of checks) {
      if (!check.productId || !check.orderId) {
        return NextResponse.json(
          { message: 'Each check must have productId and orderId' },
          { status: 400 }
        )
      }
    }

    // Get all reviews for this user with the specified products and orders
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId,
        AND: [
          {
            OR: checks.map(check => ({
              AND: [
                { productId: check.productId },
                { orderId: check.orderId }
              ]
            }))
          }
        ]
      },
      select: {
        id: true,
        productId: true,
        orderId: true,
        rating: true,
        createdAt: true
      }
    })

    // Create a map for quick lookup
    const reviewMap = new Map()
    reviews.forEach(review => {
      const key = `${review.productId}-${review.orderId}`
      reviewMap.set(key, review)
    })

    // Build response array
    const reviewStatuses = checks.map(check => {
      const key = `${check.productId}-${check.orderId}`
      const review = reviewMap.get(key)
      
      return {
        productId: check.productId,
        orderId: check.orderId,
        hasReviewed: !!review,
        reviewId: review?.id,
        rating: review?.rating,
        reviewDate: review?.createdAt?.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      reviewStatuses
    })

  } catch (error) {
    console.error('Error checking review statuses:', error)
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะการรีวิว',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 