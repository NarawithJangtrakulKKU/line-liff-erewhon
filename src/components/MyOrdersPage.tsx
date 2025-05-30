'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { 
  Calendar, 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  X
} from 'lucide-react'
import { useLiff } from '@/app/contexts/LiffContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod?: 'CREDIT_CARD' | 'PROMPTPAY' | 'BANK_TRANSFER' | 'COD' | 'LINE_PAY'
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  notes?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  address: {
    name: string
    phone: string
    address: string
    district: string
    subDistrict: string
    province: string
    postalCode: string
  }
  orderItems: OrderItem[]
}

const statusConfig = {
  PENDING: { 
    label: 'รอการยืนยัน', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'คำสั่งซื้อของคุณกำลังรอการยืนยัน',
    canCancel: true,
    priority: 1
  },
  CONFIRMED: { 
    label: 'ยืนยันแล้ว', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    description: 'คำสั่งซื้อได้รับการยืนยันแล้ว',
    canCancel: true,
    priority: 2
  },
  PROCESSING: { 
    label: 'กำลังเตรียมสินค้า', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Package,
    description: 'เรากำลังเตรียมสินค้าของคุณ',
    canCancel: false,
    priority: 3
  },
  SHIPPED: { 
    label: 'จัดส่งแล้ว', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
    description: 'สินค้าของคุณถูกจัดส่งแล้ว',
    canCancel: false,
    priority: 4
  },
  DELIVERED: { 
    label: 'ได้รับสินค้าแล้ว', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'คุณได้รับสินค้าเรียบร้อยแล้ว',
    canCancel: false,
    priority: 5
  },
  CANCELLED: { 
    label: 'ยกเลิก', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'คำสั่งซื้อถูกยกเลิก',
    canCancel: false,
    priority: 6
  },
  REFUNDED: { 
    label: 'คืนเงินแล้ว', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    description: 'เงินได้รับการคืนแล้ว',
    canCancel: false,
    priority: 7
  }
}

const paymentStatusConfig = {
  PENDING: { label: 'รอการชำระ', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  PAID: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-800 border-green-200' },
  FAILED: { label: 'ชำระไม่สำเร็จ', color: 'bg-red-100 text-red-800 border-red-200' },
  REFUNDED: { label: 'คืนเงินแล้ว', color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

const paymentMethodConfig = {
  CREDIT_CARD: 'บัตรเครดิต',
  PROMPTPAY: 'พร้อมเพย์',
  BANK_TRANSFER: 'โอนเงิน',
  COD: 'เก็บเงินปลายทาง',
  LINE_PAY: 'LINE Pay'
}

export default function MyOrdersPage() {
  const { isInitialized, isLoggedIn, dbUser } = useLiff()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('active')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!dbUser) return

      try {
        setLoading(true)
        const { data } = await axios.get(`/api/orders?userId=${dbUser.id}`)
        setOrders(data.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (dbUser) {
      fetchOrders()
    }
  }, [dbUser])

  // Filter active orders (not delivered, cancelled, or refunded)
  const activeOrders = orders.filter(order => 
    !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)
  ).sort((a, b) => {
    // Sort by priority (pending first) then by date
    const priorityDiff = statusConfig[a.status].priority - statusConfig[b.status].priority
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Filter orders that need attention (pending payment or failed payment, but not cancelled/refunded/delivered)
  const attentionOrders = orders.filter(order => 
    (order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED') &&
    !['CANCELLED', 'REFUNDED', 'DELIVERED'].includes(order.status)
  )

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrder(orderId)
      
      const response = await axios.patch(`/api/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation'
      })

      if (response.data.success) {
        // Update local state
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: 'CANCELLED' as const }
              : order
          )
        )
        
        // Show success message
        setSuccessMessage('คำสั่งซื้อถูกยกเลิกเรียบร้อยแล้ว')
        setShowSuccessModal(true)
      } else {
        throw new Error(response.data.error || 'Failed to cancel order')
      }
    } catch (error: unknown) {
      console.error('Error cancelling order:', error)
      
      // Show specific error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'ไม่สามารถยกเลิกคำสั่งซื้อได้'
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
    } finally {
      setCancellingOrder(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const orderDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'เมื่อสักครู่'
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'เมื่อวาน'
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`
    
    return formatDate(dateString)
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-orange-700">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="pt-20 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
              <p className="mt-4 text-orange-700">กำลังโหลดคำสั่งซื้อ...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50">
      <div className="pt-20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-orange-900">คำสั่งซื้อของฉัน</h1>
            </div>
            <p className="text-orange-700">ติดตามและจัดการคำสั่งซื้อที่กำลังดำเนินการ</p>
          </div>

          {/* Alert for orders needing attention */}
          {attentionOrders.length > 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">
                      คำสั่งซื้อที่ต้องการความสนใจ
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      คุณมี {attentionOrders.length} คำสั่งซื้อที่รอการชำระเงินหรือชำระไม่สำเร็จ
                    </p>
                    <Button 
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => setActiveTab('attention')}
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">คำสั่งซื้อที่กำลังดำเนินการ</p>
                    <p className="text-2xl font-bold text-orange-600">{activeOrders.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">รอการยืนยัน</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {activeOrders.filter(order => order.status === 'PENDING').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">กำลังจัดส่ง</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {activeOrders.filter(order => order.status === 'SHIPPED').length}
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                คำสั่งซื้อที่กำลังดำเนินการ ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="attention" className={attentionOrders.length > 0 ? 'text-yellow-700' : ''}>
                ต้องการความสนใจ ({attentionOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {/* Active Orders List */}
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่มีคำสั่งซื้อที่กำลังดำเนินการ</h3>
                      <p className="text-gray-500 mb-6">คำสั่งซื้อทั้งหมดของคุณเสร็จสิ้นแล้ว</p>
                      <Button 
                        onClick={() => router.push('/home')}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        ช้อปปิ้งต่อ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => {
                    const statusInfo = statusConfig[order.status]
                    const StatusIcon = statusInfo.icon
                    const paymentInfo = paymentStatusConfig[order.paymentStatus]

                    return (
                      <Card key={order.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-100 p-2 rounded-lg">
                                <StatusIcon className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  คำสั่งซื้อ #{order.orderNumber}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {getTimeAgo(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">สถานะการชำระเงิน</p>
                              <Badge variant="outline" className={paymentInfo.color}>
                                {paymentInfo.label}
                              </Badge>
                            </div>
                            {order.paymentMethod && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">วิธีการชำระเงิน</p>
                                <p className="text-sm font-medium">
                                  {paymentMethodConfig[order.paymentMethod]}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">จำนวนสินค้า</p>
                              <p className="text-sm font-medium">
                                {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">ยอดรวม</p>
                              <p className="text-lg font-bold text-orange-600">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                          </div>

                          {order.trackingNumber && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  หมายเลขติดตาม: {order.trackingNumber}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Order Items Preview */}
                          <div className="space-y-2 mb-4">
                            {order.orderItems.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                {item.product.imageUrl && (
                                  <Image
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                )}
                                <span className="flex-1">{item.product.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                                <span className="font-medium">{formatPrice(item.total)}</span>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <p className="text-sm text-gray-500 text-center">
                                และอีก {order.orderItems.length - 2} รายการ
                              </p>
                            )}
                          </div>

                          <Separator className="my-4" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{getTimeAgo(order.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrderDetail(order)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                ดูรายละเอียด
                              </Button>
                              
                              {statusInfo.canCancel && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="destructive"
                                      size="sm"
                                      disabled={cancellingOrder === order.id}
                                      className="flex items-center gap-2"
                                    >
                                      {cancellingOrder === order.id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          กำลังยกเลิก...
                                        </>
                                      ) : (
                                        <>
                                          <X className="h-4 w-4" />
                                          ยกเลิก
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>ยกเลิกคำสั่งซื้อ</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        คุณแน่ใจหรือไม่ที่จะยกเลิกคำสั่งซื้อ #{order.orderNumber}? 
                                        การดำเนินการนี้ไม่สามารถยกเลิกได้ และสินค้าจะถูกคืนเข้าสต็อก
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel disabled={cancellingOrder === order.id}>
                                        ยกเลิก
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={cancellingOrder === order.id}
                                      >
                                        {cancellingOrder === order.id ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            กำลังยกเลิก...
                                          </>
                                        ) : (
                                          'ยืนยันยกเลิก'
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attention" className="mt-6">
              {/* Orders Needing Attention */}
              {attentionOrders.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">ทุกอย่างเรียบร้อย</h3>
                      <p className="text-gray-500">ไม่มีคำสั่งซื้อที่ต้องการความสนใจในขณะนี้</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {attentionOrders.map((order) => {
                    const statusInfo = statusConfig[order.status]
                    const StatusIcon = statusInfo.icon
                    const paymentInfo = paymentStatusConfig[order.paymentStatus]

                    return (
                      <Card key={order.id} className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  คำสั่งซื้อ #{order.orderNumber}
                                </h3>
                                <Badge className={paymentInfo.color}>
                                  {paymentInfo.label}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-yellow-700 mb-3">
                                {order.paymentStatus === 'PENDING' 
                                  ? 'คำสั่งซื้อนี้รอการชำระเงิน กรุณาชำระเงินเพื่อให้เราดำเนินการต่อหากทำการชำระเงินแล้วโปรดรอให้เจ้าหน้าที่ทำการยืนยันการชำระเงิน' 
                                  : 'การชำระเงินไม่สำเร็จ กรุณาลองชำระใหม่อีกครั้ง'
                                }
                              </p>

                              <div className="flex items-center gap-4 text-sm mb-4">
                                <span className="text-gray-600">
                                  ยอดรวม: <span className="font-bold text-orange-600">{formatPrice(order.total)}</span>
                                </span>
                                <span className="text-gray-500">
                                  {getTimeAgo(order.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600"
                                  onClick={() => {
                                    // Navigate to payment page
                                    router.push(`/payment/${order.id}`)
                                  }}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  ชำระเงิน
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrderDetail(order)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูรายละเอียด
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Order Detail Modal */}
          <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  รายละเอียดคำสั่งซื้อ #{selectedOrder?.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  ข้อมูลการสั่งซื้อและการจัดส่งของคุณ
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      {React.createElement(statusConfig[selectedOrder.status].icon, {
                        className: "h-6 w-6 text-orange-600"
                      })}
                      <div>
                        <h3 className="font-semibold text-orange-900">
                          {statusConfig[selectedOrder.status].label}
                        </h3>
                        <p className="text-sm text-orange-700">
                          {statusConfig[selectedOrder.status].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Alert */}
                  {(selectedOrder.paymentStatus === 'PENDING' || selectedOrder.paymentStatus === 'FAILED') && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            {selectedOrder.paymentStatus === 'PENDING' ? 'รอการชำระเงิน' : 'การชำระเงินไม่สำเร็จ'}
                          </h4>
                          <p className="text-sm text-yellow-700">
                            {selectedOrder.paymentStatus === 'PENDING' 
                              ? 'กรุณาชำระเงินเพื่อให้เราดำเนินการจัดส่งสินค้า' 
                              : 'กรุณาลองชำระเงินใหม่อีกครั้ง'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">ข้อมูลคำสั่งซื้อ</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">เลขที่คำสั่งซื้อ</span>
                          <span className="font-mono text-sm">{selectedOrder.orderNumber}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">วันที่สั่ง</span>
                          <span className="text-sm">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">สถานะการชำระ</span>
                          <Badge className={paymentStatusConfig[selectedOrder.paymentStatus].color}>
                            {paymentStatusConfig[selectedOrder.paymentStatus].label}
                          </Badge>
                        </div>
                        {selectedOrder.paymentMethod && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">วิธีการชำระ</span>
                            <span className="text-sm">{paymentMethodConfig[selectedOrder.paymentMethod]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">ข้อมูลการจัดส่ง</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{selectedOrder.address.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedOrder.address.phone}</span>
                        </div>
                        <div className="text-sm text-gray-600 pl-6">
                          {selectedOrder.address.address}<br />
                          {selectedOrder.address.district} {selectedOrder.address.subDistrict}<br />
                          {selectedOrder.address.province} {selectedOrder.address.postalCode}
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                หมายเลขติดตาม: {selectedOrder.trackingNumber}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">รายการสินค้า</h4>
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          {item.product.imageUrl && (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{formatPrice(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">สรุปยอดเงิน</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ยอดรวมสินค้า</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ค่าจัดส่ง</span>
                        <span>{formatPrice(selectedOrder.shippingFee)}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ภาษี</span>
                          <span>{formatPrice(selectedOrder.tax)}</span>
                        </div>
                      )}
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>ส่วนลด</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium text-lg">
                        <span>ยอดรวมสุทธิ</span>
                        <span className="text-orange-600">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">หมายเหตุ</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {(selectedOrder.paymentStatus === 'PENDING' || selectedOrder.paymentStatus === 'FAILED') && (
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => {
                          setShowOrderDetail(false)
                          router.push(`/payment/${selectedOrder.id}`)
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        ชำระเงิน
                      </Button>
                    )}

                    {selectedOrder.trackingNumber && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Open tracking page
                          window.open(`https://track.thailandpost.co.th/?trackNumber=${selectedOrder.trackingNumber}`, '_blank')
                        }}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        ติดตามพัสดุ
                      </Button>
                    )}

                    {statusConfig[selectedOrder.status].canCancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            size="sm"
                            disabled={cancellingOrder === selectedOrder.id}
                            className="flex items-center gap-2"
                          >
                            {cancellingOrder === selectedOrder.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                กำลังยกเลิก...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                ยกเลิกคำสั่งซื้อ
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยกเลิกคำสั่งซื้อ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ที่จะยกเลิกคำสั่งซื้อ #{selectedOrder.orderNumber}? 
                              การดำเนินการนี้ไม่สามารถยกเลิกได้ และสินค้าจะถูกคืนเข้าสต็อก
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={cancellingOrder === selectedOrder.id}>
                              ยกเลิก
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleCancelOrder(selectedOrder.id)
                                setShowOrderDetail(false)
                              }}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={cancellingOrder === selectedOrder.id}
                            >
                              {cancellingOrder === selectedOrder.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  กำลังยกเลิก...
                                </>
                              ) : (
                                'ยืนยันยกเลิก'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        // Contact support
                        setShowContactModal(true)
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      ติดต่อเรา
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  ดำเนินการสำเร็จ
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700">{successMessage}</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ตกลง
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Error Modal */}
          <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-6 w-6" />
                  เกิดข้อผิดพลาด
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700">{errorMessage}</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowErrorModal(false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  ตกลง
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Contact Modal */}
          <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-600">
                  <Phone className="h-6 w-6" />
                  ติดต่อฝ่ายบริการลูกค้า
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">โทรศัพท์</p>
                    <p className="text-blue-700">02-XXX-XXXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">L</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">LINE Official</p>
                    <p className="text-green-700">@erewhon-support</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>เวลาทำการ: จันทร์ - ศุกร์ 9:00 - 18:00 น.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowContactModal(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ตกลง
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}