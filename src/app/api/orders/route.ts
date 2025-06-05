import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, PaymentMethod, ShippingMethod } from '@prisma/client'

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

const prisma = new PrismaClient()

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

interface OrderSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  discount?: number
}

interface OrderData {
  userId: string
  addressId: string
  items: OrderItem[]
  summary: OrderSummary
  paymentMethod: string
  shippingMethod: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const data: OrderData = await req.json()
    
    // Validate shipping method
    if (!data.shippingMethod || !['TH_POST', 'TH_EXPRESS'].includes(data.shippingMethod)) {
      return NextResponse.json(
        { error: 'Invalid shipping method. Must be TH_POST or TH_EXPRESS' },
        { status: 400 }
      )
    }

    // Validate payment method
    if (!data.paymentMethod || !['CREDIT_CARD', 'PROMPTPAY', 'BANK_TRANSFER', 'COD', 'LINE_PAY'].includes(data.paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!data.userId || !data.addressId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, addressId, or items' },
        { status: 400 }
      )
    }

    // Validate that all items have valid productId
    for (const item of data.items) {
      if (!item.productId) {
        return NextResponse.json(
          { error: 'Invalid product in cart items. All items must have productId' },
          { status: 400 }
        )
      }
    }

    // Verify that the address belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id: data.addressId,
        userId: data.userId
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Invalid address or address does not belong to user' },
        { status: 400 }
      )
    }

    // Verify that all products exist and have sufficient stock
    const productIds = data.items.map((item: OrderItem) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products are not found or inactive' },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId)
      if (product && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }
    
    // Create order with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD${Date.now()}`, // สร้างเลขที่คำสั่งซื้อ
          userId: data.userId,
          addressId: data.addressId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod as PaymentMethod,
          shippingMethod: data.shippingMethod as ShippingMethod,
          subtotal: data.summary.subtotal,
          shippingFee: data.summary.shipping,
          tax: data.summary.tax,
          discount: data.summary.discount || 0,
          total: data.summary.total,
          notes: data.notes || null,
          orderItems: {
            create: data.items.map((item: OrderItem) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            }))
          }
        },
        include: { 
          orderItems: {
            include: {
              product: true
            }
          },
          address: true,
          user: true
        }
      })

      // Update product stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Create initial order status log
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created'
        }
      })

      return order
    })

    return NextResponse.json({ 
      success: true, 
      order: result,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to create order',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET method to fetch orders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    console.log('GET /api/orders called with:', { userId, orderId })

    if (orderId) {
      console.log('Searching for order with ID:', orderId)
      
      // Fetch specific order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: true
                }
              }
            }
          },
          address: true,
          user: true,
          orderStatusLogs: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      console.log('Order found:', order ? 'Yes' : 'No')
      
      if (!order) {
        console.log('Order not found in database for ID:', orderId)
        return NextResponse.json(
          { error: 'Order not found', orderId },
          { status: 404 }
        )
      }

      console.log('Returning order data for ID:', orderId)
      
      // แปลง Decimal values เป็น numbers เพื่อป้องกัน NaN
      const formattedOrder = {
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
            price: Number(item.product.price),
            comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null
          }
        }))
      }
      
      return NextResponse.json({ success: true, order: formattedOrder })
    }

    if (userId) {
      console.log('Searching for orders for user ID:', userId)
      
      // Fetch user orders
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: true
                }
              }
            }
          },
          address: true
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log('Found orders for user:', orders.length)
      
      // แปลง Decimal values เป็น numbers เพื่อป้องกัน NaN
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
            price: Number(item.product.price),
            comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null
          }
        }))
      }))
      
      return NextResponse.json({ success: true, orders: formattedOrders })
    }

    console.log('Missing required parameter: userId or orderId')
    return NextResponse.json(
      { error: 'Missing required parameter: userId or orderId' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}