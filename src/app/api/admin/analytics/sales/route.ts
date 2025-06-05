import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SalesDataPoint {
  period: string
  orders: number
  revenue: number
  label: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month, year
    const limit = parseInt(searchParams.get('limit') || '12')

    let salesData: SalesDataPoint[] = []

    switch (period) {
      case 'day':
        // Last 30 days
        salesData = await getDailySales(30)
        break
      case 'week':
        // Last 12 weeks
        salesData = await getWeeklySales(12)
        break
      case 'month':
        // Last 12 months
        salesData = await getMonthlySales(limit)
        break
      case 'year':
        // Last 5 years
        salesData = await getYearlySales(5)
        break
      default:
        salesData = await getMonthlySales(12)
    }

    // Get payment method distribution
    const paymentMethods = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where: {
        paymentStatus: 'PAID',
        paymentMethod: { not: null }
      },
      _count: { paymentMethod: true },
      _sum: { total: true }
    })

    // Get top selling categories
    const topCategories = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      _count: { productId: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    })

    // Get category details
    const productIds = topCategories.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { 
        category: {
          select: { id: true, name: true }
        }
      }
    })

    // Group by category
    const categoryStats = new Map()
    topCategories.forEach(item => {
      const product = products.find(p => p.id === item.productId)
      if (product?.category) {
        const categoryId = product.category.id
        const categoryName = product.category.name
        
        if (categoryStats.has(categoryId)) {
          const existing = categoryStats.get(categoryId)
          categoryStats.set(categoryId, {
            ...existing,
            totalSold: existing.totalSold + (item._sum.quantity || 0),
            totalRevenue: existing.totalRevenue + Number(item._sum.total || 0),
            productCount: existing.productCount + 1
          })
        } else {
          categoryStats.set(categoryId, {
            categoryId,
            categoryName,
            totalSold: item._sum.quantity || 0,
            totalRevenue: Number(item._sum.total || 0),
            productCount: 1
          })
        }
      }
    })

    const topCategoriesData = Array.from(categoryStats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        salesData,
        paymentMethods: paymentMethods.map(pm => ({
          method: pm.paymentMethod,
          count: pm._count.paymentMethod,
          total: Number(pm._sum.total || 0)
        })),
        topCategories: topCategoriesData,
        period,
        totalDataPoints: salesData.length
      }
    })

  } catch (error) {
    console.error('Error fetching sales analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch sales data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function getDailySales(days: number) {
  const salesData: SalesDataPoint[] = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    
    const [orders, revenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { total: true }
      })
    ])
    
    salesData.push({
      period: startOfDay.toISOString().split('T')[0],
      orders,
      revenue: Number(revenue._sum.total || 0),
      label: startOfDay.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'short' 
      })
    })
  }
  
  return salesData
}

async function getWeeklySales(weeks: number) {
  const salesData: SalesDataPoint[] = []
  const now = new Date()
  
  for (let i = weeks - 1; i >= 0; i--) {
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() - (i * 7))
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 6)
    
    const startOfWeek = new Date(startDate.setHours(0, 0, 0, 0))
    const endOfWeek = new Date(endDate.setHours(23, 59, 59, 999))
    
    const [orders, revenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfWeek, lte: endOfWeek }
        }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfWeek, lte: endOfWeek }
        },
        _sum: { total: true }
      })
    ])
    
    salesData.push({
      period: `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`,
      orders,
      revenue: Number(revenue._sum.total || 0),
      label: `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`
    })
  }
  
  return salesData
}

async function getMonthlySales(months: number) {
  const salesData: SalesDataPoint[] = []
  const now = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const [orders, revenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { total: true }
      })
    ])
    
    salesData.push({
      period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      orders,
      revenue: Number(revenue._sum.total || 0),
      label: date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'short' 
      })
    })
  }
  
  return salesData
}

async function getYearlySales(years: number) {
  const salesData: SalesDataPoint[] = []
  const now = new Date()
  
  for (let i = years - 1; i >= 0; i--) {
    const year = now.getFullYear() - i
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)
    
    const [orders, revenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfYear, lte: endOfYear }
        },
        _sum: { total: true }
      })
    ])
    
    salesData.push({
      period: year.toString(),
      orders,
      revenue: Number(revenue._sum.total || 0),
      label: year.toString()
    })
  }
  
  return salesData
} 