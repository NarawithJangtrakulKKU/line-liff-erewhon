'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react'
import axios from 'axios'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    totalCategories: number
    newUsersLast7Days: number
    ordersLast30Days: number
  }
  growth: {
    orderGrowth: number
    revenueGrowth: number
    thisMonthOrders: number
    lastMonthOrders: number
    thisMonthRevenue: number
    lastMonthRevenue: number
  }
  orderStatus: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  inventory: {
    activeProducts: number
    outOfStockProducts: number
    stockRate: string
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    paymentStatus: string
    itemCount: number
    createdAt: string
  }>
  topProducts: Array<{
    productId: string
    name: string
    price: number
    totalSold: number
    orderCount: number
  }>
}

interface SalesData {
  salesData: Array<{
    period: string
    orders: number
    revenue: number
    label: string
  }>
  paymentMethods: Array<{
    method: string
    count: number
    total: number
  }>
  topCategories: Array<{
    categoryId: string
    categoryName: string
    totalSold: number
    totalRevenue: number
    productCount: number
  }>
  period: string
  totalDataPoints: number
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [salesPeriod, setSalesPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/analytics/overview')
      
      if (response.data.success) {
        setAnalyticsData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/analytics/sales?period=${salesPeriod}`)
      
      if (response.data.success) {
        setSalesData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    }
  }, [salesPeriod])

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData()
    }
  }, [activeTab, salesPeriod, fetchSalesData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'PROCESSING': return <Activity className="h-4 w-4 text-blue-500" />
      case 'SHIPPED': return <Truck className="h-4 w-4 text-purple-500" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 md:ml-64">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <AdminSidebar isMobile={true} />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">ภาพรวมและสถิติของระบบ</p>
            </div>
            <Button onClick={fetchAnalyticsData} disabled={loading}>
              <Activity className="h-4 w-4 mr-2" />
              รีเฟรชข้อมูล
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
              <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
              <TabsTrigger value="products">สินค้า</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {analyticsData && (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUsers)}</div>
                        <p className="text-xs text-muted-foreground">
                          +{analyticsData.overview.newUsersLast7Days} ใน 7 วันที่ผ่านมา
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">คำสั่งซื้อทั้งหมด</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalOrders)}</div>
                        <p className="text-xs text-muted-foreground">
                          +{analyticsData.overview.ordersLast30Days} ใน 30 วันที่ผ่านมา
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                        <div className="flex items-center text-xs">
                          {analyticsData.growth.revenueGrowth >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className={analyticsData.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {analyticsData.growth.revenueGrowth}%
                          </span>
                          <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalProducts)}</div>
                        <p className="text-xs text-muted-foreground">
                          {analyticsData.inventory.stockRate}% มีสต็อก
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Status Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>สถานะคำสั่งซื้อ</CardTitle>
                        <CardDescription>การกระจายตัวของสถานะคำสั่งซื้อปัจจุบัน</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(analyticsData.orderStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(status)}
                              <span className="capitalize">{status}</span>
                            </div>
                            <Badge className={getStatusColor(status)}>
                              {formatNumber(count)}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>สินค้าขายดี</CardTitle>
                        <CardDescription>สินค้าที่มียอดขายสูงสุด</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                            <div key={product.productId} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{product.name}</p>
                                  <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">{formatNumber(product.totalSold)} ชิ้น</p>
                                <p className="text-xs text-gray-500">{product.orderCount} คำสั่งซื้อ</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
                      <CardDescription>คำสั่งซื้อที่เข้ามาใหม่</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">{order.customerName}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(order.total)}</p>
                                <p className="text-sm text-gray-500">{order.itemCount} รายการ</p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">ข้อมูลยอดขาย</h2>
                <Select value={salesPeriod} onValueChange={setSalesPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="เลือกช่วงเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">รายวัน (30 วัน)</SelectItem>
                    <SelectItem value="week">รายสัปดาห์ (12 สัปดาห์)</SelectItem>
                    <SelectItem value="month">รายเดือน (12 เดือน)</SelectItem>
                    <SelectItem value="year">รายปี (5 ปี)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {salesData && (
                <>
                  {/* Sales Chart Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>กราฟยอดขาย</CardTitle>
                      <CardDescription>ยอดขายและจำนวนคำสั่งซื้อตามช่วงเวลา</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">กราฟยอดขาย ({salesData.totalDataPoints} จุดข้อมูล)</p>
                          <p className="text-sm text-gray-400">รายได้รวม: {formatCurrency(salesData.salesData.reduce((sum, item) => sum + item.revenue, 0))}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Methods & Top Categories */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>วิธีการชำระเงิน</CardTitle>
                        <CardDescription>การกระจายตัวของวิธีการชำระเงิน</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {salesData.paymentMethods.map((method) => (
                            <div key={method.method} className="flex items-center justify-between">
                              <span className="capitalize">{method.method}</span>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(method.total)}</p>
                                <p className="text-sm text-gray-500">{method.count} รายการ</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>หมวดหมู่ขายดี</CardTitle>
                        <CardDescription>หมวดหมู่สินค้าที่มียอดขายสูงสุด</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {salesData.topCategories.map((category, index) => (
                            <div key={category.categoryId} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                                </div>
                                <span>{category.categoryName}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(category.totalRevenue)}</p>
                                <p className="text-sm text-gray-500">{category.totalSold} ชิ้น</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <h2 className="text-2xl font-bold">ข้อมูลสินค้า</h2>
              
              {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>สินค้าทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{formatNumber(analyticsData.overview.totalProducts)}</div>
                      <p className="text-sm text-gray-500">สินค้าที่เปิดใช้งาน</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>สินค้าในสต็อก</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{formatNumber(analyticsData.inventory.activeProducts)}</div>
                      <p className="text-sm text-gray-500">{analyticsData.inventory.stockRate}% ของสินค้าทั้งหมด</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>สินค้าหมดสต็อก</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">{formatNumber(analyticsData.inventory.outOfStockProducts)}</div>
                      <p className="text-sm text-gray-500">ต้องเติมสต็อก</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
