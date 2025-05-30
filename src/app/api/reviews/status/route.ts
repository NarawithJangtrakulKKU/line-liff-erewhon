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

    // First, get all order items for the specified orders and products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          id: { in: checks.map(check => check.orderId) },
          userId: userId
        },
        productId: { in: checks.map(check => check.productId) }
      },
      select: {
        id: true,
        productId: true,
        orderId: true
      }
    })

    // Create a map of productId-orderId to orderItemId
    const orderItemMap = new Map()
    orderItems.forEach(item => {
      const key = `${item.productId}-${item.orderId}`
      orderItemMap.set(key, item.id)
    })

    // Get all reviews for this user with the specified order items
    const orderItemIds = Array.from(orderItemMap.values())
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId,
        orderItemId: { in: orderItemIds }
      },
      select: {
        id: true,
        productId: true,
        orderId: true,
        orderItemId: true,
        rating: true,
        createdAt: true
      }
    })

    // Create a map for quick lookup by orderItemId
    const reviewMap = new Map()
    reviews.forEach(review => {
      reviewMap.set(review.orderItemId, review)
    })

    // Build response array
    const reviewStatuses = checks.map(check => {
      const key = `${check.productId}-${check.orderId}`
      const orderItemId = orderItemMap.get(key)
      const review = orderItemId ? reviewMap.get(orderItemId) : null
      
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