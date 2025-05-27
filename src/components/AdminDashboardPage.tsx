'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AdminSidebar from '@/components/AdminSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

// Types
interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  pendingOrders: number
  deliveredOrders: number
  revenueGrowth: number
  ordersGrowth: number
  productsGrowth: number
  usersGrowth: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  user: {
    displayName: string
    pictureUrl?: string
  }
}

interface TopProduct {
  productId: string
  productName: string
  imageUrl?: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
  stock?: number
}

interface Category {
  id: string
  name: string
  _count: {
    products: number
  }
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('th-TH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusConfig = (status: string) => {
  const configs = {
    PENDING: { variant: "secondary", className: "bg-yellow-100 text-yellow-800", label: "Pending" },
    CONFIRMED: { variant: "default", className: "bg-blue-100 text-blue-800", label: "Confirmed" },
    PROCESSING: { variant: "default", className: "bg-purple-100 text-purple-800", label: "Processing" },
    SHIPPED: { variant: "default", className: "bg-indigo-100 text-indigo-800", label: "Shipped" },
    DELIVERED: { variant: "default", className: "bg-green-100 text-green-800", label: "Delivered" },
    CANCELLED: { variant: "destructive", className: "bg-red-100 text-red-800", label: "Cancelled" },
    REFUNDED: { variant: "destructive", className: "bg-gray-100 text-gray-800", label: "Refunded" },
  }
  return configs[status as keyof typeof configs] || configs.PENDING
}

const getStatusBadge = (status: string) => {
  const config = getStatusConfig(status)
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  
  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    usersGrowth: 0
  })
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch all data in parallel
      const [
        ordersStatsRes,
        recentOrdersRes,
        productsRes,
        categoriesRes,
        usersRes
      ] = await Promise.all([
        axios.get('/api/admin/orders/stats'),
        axios.get('/api/admin/orders?limit=5'),
        axios.get('/api/admin/products?limit=5'),
        axios.get('/api/admin/categories'),
        axios.get('/api/admin/users/stats')
      ])

      // Extract order statistics
      const orderStats = ordersStatsRes.data.stats
      const orders = recentOrdersRes.data.orders || []
      const products = productsRes.data.products || []
      const categoriesData = categoriesRes.data.categories || []
      const userStats = usersRes.data.stats

      // Calculate growth rates (mock calculation for now)
      const currentMonth = new Date().getMonth()
      const mockGrowthData = {
        revenueGrowth: 20.1,
        ordersGrowth: 15.3,
        productsGrowth: 8.5
      }

      // Set stats
      setStats({
        totalRevenue: orderStats.overview?.totalRevenue || 0,
        totalOrders: orderStats.overview?.totalOrders || 0,
        totalProducts: products.length > 0 ? (productsRes.data.pagination?.total || products.length) : 0,
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        newUsers: userStats.newUsers || 0,
        pendingOrders: orderStats.statusBreakdown?.PENDING || 0,
        deliveredOrders: orderStats.statusBreakdown?.DELIVERED || 0,
        usersGrowth: userStats.usersGrowth || 0,
        ...mockGrowthData
      })

      // Set recent orders
      setRecentOrders(orders.slice(0, 5))

      // Set top products (from order stats or product list)
      if (orderStats.topProducts && orderStats.topProducts.length > 0) {
        setTopProducts(orderStats.topProducts.slice(0, 5))
      } else {
        // Fallback to recent products
        const productsWithMockStats = products.slice(0, 5).map((product: any, index: number) => ({
          productId: product.id,
          productName: product.name,
          imageUrl: product.images?.[0]?.imageUrl,
          totalQuantity: 50 - index * 10,
          totalRevenue: (50 - index * 10) * Number(product.price),
          orderCount: 25 - index * 5,
          stock: product.stock
        }))
        setTopProducts(productsWithMockStats)
      }

      // Set categories
      setCategories(categoriesData.slice(0, 4))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to load dashboard data'
          : 'An error occurred while loading dashboard data'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  // Navigation handlers
  const handleViewOrders = () => router.push('/admin/orders')
  const handleViewProducts = () => router.push('/admin/products')
  const handleViewUsers = () => router.push('/admin/users')
  const handleViewCategories = () => router.push('/admin/categories')
  const handleAddProduct = () => router.push('/admin/products?action=create')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="md:pl-64">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="md:pl-64">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <AdminSidebar isMobile={true} />
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">ภาพรวมของร้านค้าออนไลน์</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </Button>
              <Button size="sm" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="ml-auto"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Total Revenue",
                value: formatCurrency(stats.totalRevenue),
                change: `+${stats.revenueGrowth}%`,
                trend: "up",
                icon: <DollarSign className="h-4 w-4 text-green-600" />
              },
              {
                title: "Total Orders",
                value: stats.totalOrders.toLocaleString(),
                change: `+${stats.ordersGrowth}%`,
                trend: "up",
                icon: <ShoppingCart className="h-4 w-4 text-blue-600" />
              },
              {
                title: "Total Products",
                value: stats.totalProducts.toLocaleString(),
                change: `+${stats.productsGrowth}%`,
                trend: "up",
                icon: <Package className="h-4 w-4 text-purple-600" />
              },
              {
                title: "Active Users",
                value: `${stats.activeUsers.toLocaleString()} / ${stats.totalUsers.toLocaleString()}`,
                change: `${stats.newUsers} new this week`,
                trend: stats.usersGrowth >= 0 ? "up" : "down",
                icon: <Users className="h-4 w-4 text-orange-600" />
              }
            ].map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {stat.change}
                    </span>
                    <span className="ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  คำสั่งซื้อล่าสุดจากลูกค้า ({stats.pendingOrders} รอดำเนินการ)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ไม่มีคำสั่งซื้อล่าสุด
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          {order.user.pictureUrl && (
                            <img
                              src={order.user.pictureUrl}
                              alt={order.user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">{order.user.displayName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(order.total)}</p>
                                <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={handleViewOrders}>
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Products
                </CardTitle>
                <CardDescription>
                  สินค้าขายดีประจำเดือน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ไม่มีข้อมูลสินค้า
                    </div>
                  ) : (
                    topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.productName}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-600">
                                ขายได้ {product.totalQuantity} ชิ้น
                              </span>
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(product.totalRevenue)}
                              </span>
                            </div>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {product.stock !== undefined 
                                  ? `Stock: ${product.stock}` 
                                  : `${product.orderCount} orders`
                                }
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={handleViewProducts}>
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                การดำเนินการที่ใช้บ่อย
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col"
                  onClick={handleAddProduct}
                >
                  <Package className="h-6 w-6 mb-2" />
                  Add Product
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col"
                  onClick={handleViewUsers}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col"
                  onClick={handleViewOrders}
                >
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  View Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col"
                  onClick={handleViewCategories}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Categories
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories Overview */}
          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categories Overview</CardTitle>
                <CardDescription>
                  จำนวนสินค้าในแต่ละหมวดหมู่
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="text-center p-4 border rounded-lg">
                      <p className="font-medium">{category.name}</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {category._count.products}
                      </p>
                      <p className="text-sm text-gray-500">products</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}