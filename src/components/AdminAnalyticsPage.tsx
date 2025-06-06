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
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react'
import axios from 'axios'
import {
  ComposedChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

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

  // Custom tooltip for sales chart
  interface TooltipPayload {
    color: string
    dataKey: string
    value: number
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{`ช่วงเวลา: ${label}`}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' 
                ? `รายได้: ${formatCurrency(entry.value)}`
                : `จำนวนคำสั่งซื้อ: ${formatNumber(entry.value)}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom tooltip for pie chart
  interface PiePayload {
    payload: {
      method: string
      total: number
      count: number
    }
  }

  interface PieTooltipProps {
    active?: boolean
    payload?: PiePayload[]
  }

  const PieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.method}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.total)}</p>
          <p className="text-sm text-gray-600">{data.count} รายการ</p>
        </div>
      )
    }
    return null
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
                  {/* Sales Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>กราฟยอดขาย</CardTitle>
                      <CardDescription>ยอดขายและจำนวนคำสั่งซื้อตามช่วงเวลา ({salesData.totalDataPoints} จุดข้อมูล)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={salesData.salesData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="label" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="orders"
                              fill="#8884d8"
                              name="จำนวนคำสั่งซื้อ"
                              radius={[4, 4, 0, 0]}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="revenue"
                              stroke="#82ca9d"
                              strokeWidth={3}
                              name="รายได้ (บาท)"
                              dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
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
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesData.paymentMethods}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ method, percent }: { method: string; percent: number }) => `${method} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="total"
                              >
                                {salesData.paymentMethods.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                          {salesData.paymentMethods.map((method, index) => (
                            <div key={method.method} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="capitalize">{method.method}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(method.total)}</p>
                                <p className="text-xs text-gray-500">{method.count} รายการ</p>
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
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={salesData.topCategories}
                              layout="horizontal"
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tick={{ fontSize: 12 }} />
                              <YAxis 
                                dataKey="categoryName" 
                                type="category" 
                                tick={{ fontSize: 10 }}
                                width={60}
                              />
                              <Tooltip
                                formatter={(value: number, name: string) => [
                                  name === 'totalRevenue' ? formatCurrency(value) : formatNumber(value),
                                  name === 'totalRevenue' ? 'รายได้' : 'จำนวนขาย'
                                ]}
                              />
                              <Bar dataKey="totalRevenue" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
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
