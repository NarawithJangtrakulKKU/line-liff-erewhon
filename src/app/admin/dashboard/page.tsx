'use client'
import React from 'react'
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
  DollarSign
} from 'lucide-react'

export default function AdminDashboard() {
  // Mock data สำหรับแสดงผล
  const stats = [
    {
      title: "Total Revenue",
      value: "฿45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4 text-green-600" />
    },
    {
      title: "Total Orders",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: <ShoppingCart className="h-4 w-4 text-blue-600" />
    },
    {
      title: "Total Products",
      value: "12,234",
      change: "+19%",
      trend: "up",
      icon: <Package className="h-4 w-4 text-purple-600" />
    },
    {
      title: "Active Users",
      value: "573",
      change: "+201",
      trend: "up",
      icon: <Users className="h-4 w-4 text-orange-600" />
    }
  ]

  const recentOrders = [
    { id: "#3001", customer: "อลิซ สมิธ", amount: "฿250.00", status: "completed", date: "2024-01-15" },
    { id: "#3002", customer: "บ็อบ จอห์นสัน", amount: "฿150.00", status: "pending", date: "2024-01-15" },
    { id: "#3003", customer: "แคโรล วิลเลียมส์", amount: "฿350.00", status: "processing", date: "2024-01-14" },
    { id: "#3004", customer: "เดวิด บราวน์", amount: "฿450.00", status: "completed", date: "2024-01-14" },
    { id: "#3005", customer: "อีวา เดวิส", amount: "฿200.00", status: "cancelled", date: "2024-01-13" }
  ]

  const topProducts = [
    { name: "iPhone 15 Pro", sold: 245, revenue: "฿245,000", stock: 12 },
    { name: "MacBook Air M2", sold: 189, revenue: "฿189,000", stock: 8 },
    { name: "AirPods Pro", sold: 156, revenue: "฿156,000", stock: 25 },
    { name: "iPad Air", sold: 134, revenue: "฿134,000", stock: 15 },
    { name: "Apple Watch", sold: 98, revenue: "฿98,000", stock: 20 }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default", className: "bg-green-100 text-green-800" },
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      processing: { variant: "default", className: "bg-blue-100 text-blue-800" },
      cancelled: { variant: "destructive", className: "bg-red-100 text-red-800" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="md:pl-64">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <AdminSidebar isMobile={true} />
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">ภาพรวมของร้านค้าออนไลน์</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
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
                  คำสั่งซื้อล่าสุดจากลูกค้า
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{order.amount}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
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
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            ขายได้ {product.sold} ชิ้น
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            {product.revenue}
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
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
                <Button variant="outline" className="h-24 flex flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Add Product
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  View Orders
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}