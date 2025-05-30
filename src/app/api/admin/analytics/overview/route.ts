import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get all statistics in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      thisMonthOrders,
      lastMonthOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      activeProducts,
      outOfStockProducts,
      totalCategories,
      recentOrders,
      topProducts,
      newUsersLast7Days,
      ordersLast30Days
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      
      // Product statistics
      prisma.product.count({ where: { isActive: true } }),
      
      // Order statistics
      prisma.order.count(),
      
      // Revenue statistics
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true }
      }),
      
      // This month orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Last month orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      
      // This month revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),
      
      // Last month revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { total: true }
      }),
      
      // Order status counts
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      
      // Product inventory
      prisma.product.count({ where: { isActive: true, stock: { gt: 0 } } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
      
      // Categories
      prisma.category.count({ where: { isActive: true } }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { displayName: true, lineUserId: true }
          },
          orderItems: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        }
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      // New users last 7 days
      prisma.user.count({
        where: {
          createdAt: { gte: last7Days }
        }
      }),
      
      // Orders last 30 days
      prisma.order.count({
        where: {
          createdAt: { gte: last30Days }
        }
      })
    ])

    // Get product details for top products
    const topProductIds = topProducts.map(item => item.productId)
    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true }
    })

    // Combine top products with details
    const topProductsWithDetails = topProducts.map(item => {
      const product = productDetails.find(p => p.id === item.productId)
      return {
        productId: item.productId,
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        totalSold: item._sum.quantity || 0,
        orderCount: item._count.productId || 0
      }
    })

    // Calculate growth rates
    const orderGrowth = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0

    const lastMonthRevenueValue = Number(lastMonthRevenue._sum.total || 0)
    const thisMonthRevenueValue = Number(thisMonthRevenue._sum.total || 0)
    const revenueGrowth = lastMonthRevenueValue > 0
      ? ((thisMonthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalCategories,
          newUsersLast7Days,
          ordersLast30Days
        },
        growth: {
          orderGrowth: Number(orderGrowth.toFixed(1)),
          revenueGrowth: Number(revenueGrowth.toFixed(1)),
          thisMonthOrders,
          lastMonthOrders,
          thisMonthRevenue: thisMonthRevenue._sum.total || 0,
          lastMonthRevenue: lastMonthRevenue._sum.total || 0
        },
        orderStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        inventory: {
          activeProducts,
          outOfStockProducts,
          stockRate: totalProducts > 0 ? ((activeProducts / totalProducts) * 100).toFixed(1) : 0
        },
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.displayName || 'Unknown',
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          itemCount: order.orderItems.length,
          createdAt: order.createdAt
        })),
        topProducts: topProductsWithDetails
      }
    })

  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 