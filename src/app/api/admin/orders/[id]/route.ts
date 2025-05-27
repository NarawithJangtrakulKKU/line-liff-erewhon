// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/orders/[id] - ดึงข้อมูลออเดอร์เฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            pictureUrl: true,
            lineUserId: true,
            email: true,
            phone: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: {
              include: {
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
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // จัดรูปแบบข้อมูล
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
          imageUrl: item.product.images[0]?.imageUrl || null
        }
      }))
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/orders/[id] - อัปเดตออเดอร์
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { 
      status, 
      paymentStatus, 
      paymentMethod, 
      shippingMethod, 
      trackingNumber, 
      notes 
    } = body

    // ตรวจสอบว่าออเดอร์มีอยู่จริง
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // อัปเดตข้อมูลออเดอร์
    const updateData: any = {}
    
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentMethod) updateData.paymentMethod = paymentMethod
    if (shippingMethod) updateData.shippingMethod = shippingMethod
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes

    // ตั้งค่าวันที่จัดส่งและส่งมอบ
    if (status === 'SHIPPED' && !existingOrder.shippedAt) {
      updateData.shippedAt = new Date()
    }
    if (status === 'DELIVERED' && !existingOrder.deliveredAt) {
      updateData.deliveredAt = new Date()
    }

    updateData.updatedAt = new Date()

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            pictureUrl: true,
            lineUserId: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: {
                    sortOrder: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    })

    // บันทึก log การเปลี่ยนแปลงสถานะ
    if (status && status !== existingOrder.status) {
      await prisma.orderStatusLog.create({
        data: {
          orderId: id,
          status: status,
          notes: `Status changed from ${existingOrder.status} to ${status}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        shippingFee: Number(updatedOrder.shippingFee),
        tax: Number(updatedOrder.tax),
        discount: Number(updatedOrder.discount),
        total: Number(updatedOrder.total),
        orderItems: updatedOrder.orderItems.map(item => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
          product: {
            ...item.product,
            imageUrl: item.product.images[0]?.imageUrl || null
          }
        }))
      }
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[id] - ลบออเดอร์
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // ตรวจสอบว่าออเดอร์มีอยู่จริง
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        orderStatusLogs: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่าสามารถลบได้หรือไม่
    if (existingOrder.status === 'DELIVERED' || existingOrder.paymentStatus === 'PAID') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete delivered or paid orders. Please refund instead.' 
        },
        { status: 400 }
      )
    }

    // ลบออเดอร์ (จะลบ orderItems และ orderStatusLogs ด้วยเนื่องจาก onDelete: Cascade)
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
