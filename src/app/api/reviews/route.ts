import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, orderId, rating, comment } = body

    console.log('Review API called with:', { userId, productId, orderId, rating, comment })

    // Validate required fields
    if (!userId || !productId || !orderId || !rating) {
      console.log('Missing required fields')
      return NextResponse.json(
        { message: 'กรุณาระบุข้อมูลที่จำเป็น (userId, productId, orderId, rating)' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      console.log('Invalid rating range:', rating)
      return NextResponse.json(
        { message: 'คะแนนต้องอยู่ระหว่าง 1-5' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('User not found:', userId)
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.log('Product not found:', productId)
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลสินค้า' },
        { status: 404 }
      )
    }

    // Check if user has purchased this product in this specific order and it's delivered
    console.log('Searching for orderItem with:', { productId, orderId })
    
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          id: orderId,
          userId: userId // Ensure this order belongs to the user
        }
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            status: true,
            orderNumber: true
          }
        }
      }
    })

    console.log('OrderItem found:', orderItem ? 'Yes' : 'No')
    if (orderItem) {
      console.log('Order details:', { 
        orderId: orderItem.order.id, 
        userId: orderItem.order.userId, 
        status: orderItem.order.status 
      })
    }

    if (!orderItem) {
      console.log('OrderItem not found for user:', userId, 'product:', productId, 'order:', orderId)
      return NextResponse.json(
        { message: 'ไม่พบรายการสินค้าในคำสั่งซื้อนี้หรือคำสั่งซื้อไม่ใช่ของคุณ' },
        { status: 403 }
      )
    }

    // Check if the order is delivered
    if (orderItem.order.status !== 'DELIVERED') {
      console.log('Order not delivered yet. Status:', orderItem.order.status)
      return NextResponse.json(
        { message: 'คุณสามารถรีวิวได้เฉพาะสินค้าที่ได้รับแล้วเท่านั้น' },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        productId: productId,
        // Check if there's a review for this specific product from this user
        // You might want to add orderId to Review model to track reviews per order
      }
    })

    if (existingReview) {
      console.log('User has already reviewed this product')
      return NextResponse.json(
        { message: 'คุณได้รีวิวสินค้านี้แล้ว' },
        { status: 409 }
      )
    }

    // Create the review
    console.log('Creating review...')
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating.toString()),
        comment: comment && comment.trim() ? comment.trim() : null
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        product: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('Review created successfully:', review.id)

    return NextResponse.json({
      message: 'รีวิวสินค้าสำเร็จ',
      review
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')

    let whereClause: any = {}

    if (productId) {
      whereClause.productId = productId
    }

    if (userId) {
      whereClause.userId = userId
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        product: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      reviews
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}