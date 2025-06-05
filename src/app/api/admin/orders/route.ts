// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

interface OrderWhereCondition {
  status?: OrderStatus
  OR?: Array<{
    orderNumber?: { contains: string; mode: 'insensitive' }
    user?: { displayName?: { contains: string; mode: 'insensitive' } }
    address?: { name?: { contains: string; mode: 'insensitive' } }
  }>
}

// GET /api/admin/orders - ดึงข้อมูลออเดอร์ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // สร้าง where condition
    const whereCondition: OrderWhereCondition = {}
    
    if (status && status !== 'ALL') {
      whereCondition.status = status as OrderStatus
    }
    
    if (search) {
      whereCondition.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { displayName: { contains: search, mode: 'insensitive' } } },
        { address: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // ดึงข้อมูลออเดอร์
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              pictureUrl: true,
              lineUserId: true,
            }
          },
          address: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    orderBy: {
                      sortOrder: 'asc'
                    }
                  }
                }
              }
            }
          },
          orderStatusLogs: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereCondition })
    ])

    // จัดรูปแบบข้อมูล
    const formattedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.imageUrl || null
        }
      }))
    }))

    // คำนวณสถิติ
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      _sum: {
        total: true
      },
      where: {
        paymentStatus: 'PAID'
      }
    })

    const totalRevenue = stats.reduce((sum, stat) => sum + Number(stat._sum.total || 0), 0)
    const pendingCount = await prisma.order.count({ where: { status: 'PENDING' } })
    const deliveredCount = await prisma.order.count({ where: { status: 'DELIVERED' } })

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      },
      stats: {
        totalOrders,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount,
        totalRevenue
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders - สร้างออเดอร์ใหม่ (สำหรับอนาคต)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      addressId, 
      orderItems, 
      paymentMethod, 
      shippingMethod,
      notes 
    } = body

    // Validate required fields
    if (!userId || !addressId || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // สร้างเลขที่ออเดอร์
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // คำนวณราคา
    const orderItemsData = []
    let subtotal = 0

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      const itemTotal = Number(product.price) * item.quantity
      subtotal += itemTotal

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      })
    }

    const shippingFee = 50 // ค่าจัดส่งเริ่มต้น
    const tax = 0 // ภาษี
    const discount = 0 // ส่วนลด
    const total = subtotal + shippingFee + tax - discount

    // สร้างออเดอร์
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        paymentMethod,
        shippingMethod,
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        notes,
        orderItems: {
          create: orderItemsData
        },
        orderStatusLogs: {
          create: {
            status: 'PENDING',
            notes: 'Order created'
          }
        }
      },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total)
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}