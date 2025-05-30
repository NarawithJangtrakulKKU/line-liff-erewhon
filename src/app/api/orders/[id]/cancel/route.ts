import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason } = await req.json()

    console.log('Cancelling order:', id, 'with reason:', reason)

    // Check if order exists and can be cancelled
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order can be cancelled (only PENDING and CONFIRMED orders can be cancelled)
    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled. Only pending or confirmed orders can be cancelled.' },
        { status: 400 }
      )
    }

    // Update order status and restore product stock
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
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

      // Restore product stock
      for (const item of existingOrder.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }

      // Create order status log
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          notes: reason || 'Order cancelled by customer'
        }
      })

      return updatedOrder
    })

    console.log('Order cancelled successfully:', id)

    return NextResponse.json({
      success: true,
      order: result,
      message: 'Order cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    
    return NextResponse.json({
      error: 'Failed to cancel order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 