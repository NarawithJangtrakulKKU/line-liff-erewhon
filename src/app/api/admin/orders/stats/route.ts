// app/api/admin/orders/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/orders/stats - ดึงสถิติออเดอร์
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month, year
    
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // สถิติทั่วไป
    const [
      totalOrders,
      totalRevenue,
      statusCounts,
      paymentCounts,
      recentOrders,
      topProducts
    ] = await Promise.all([
      // จำนวนออเดอร์ทั้งหมด
      prisma.order.count(),
      
      // รายได้รวม (เฉพาะที่ชำระแล้ว)
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID'
        },
        _sum: {
          total: true
        }
      }),
      
      // จำนวนตามสถานะ
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // จำนวนตามสถานะการชำระเงิน
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: {
          id: true
        }
      }),
      
      // ออเดอร์ล่าสุด
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              displayName: true,
              pictureUrl: true
            }
          }
        }
      }),
      
      // สินค้าขายดี
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          total: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      })
    ])

    // สถิติในช่วงเวลาที่เลือก
    const periodStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        total: true
      }
    })

    // ดึงข้อมูลสินค้าขายดี
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            images: {
              take: 1,
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        })
        return {
          ...item,
          product
        }
      })
    )

    return NextResponse.json({
      success: true,
      stats: {
        overview: {
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          periodOrders: periodStats._count.id,
          periodRevenue: Number(periodStats._sum.total || 0)
        },
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id
          return acc
        }, {} as Record<string, number>),
        paymentBreakdown: paymentCounts.reduce((acc, item) => {
          acc[item.paymentStatus] = item._count.id
          return acc
        }, {} as Record<string, number>),
        recentOrders: recentOrders.map(order => ({
          ...order,
          total: Number(order.total)
        })),
        topProducts: topProductsWithDetails.map(item => ({
          productId: item.productId,
          productName: item.product?.name || 'Unknown',
          imageUrl: item.product?.images[0]?.imageUrl || null,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.total || 0),
          orderCount: item._count.id
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch order statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}