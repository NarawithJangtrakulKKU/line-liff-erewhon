'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, 
  ChevronRight, 
  Calendar, 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react'
import { useLiff } from '@/app/contexts/LiffContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'คำสั่งซื้อของคุณกำลังรอการยืนยัน'
  },
  CONFIRMED: { 
    label: 'ยืนยันแล้ว', 
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'คำสั่งซื้อได้รับการยืนยันแล้ว'
  },
  PROCESSING: { 
    label: 'กำลังเตรียมสินค้า', 
    color: 'bg-orange-100 text-orange-800',
    icon: Package,
    description: 'เรากำลังเตรียมสินค้าของคุณ'
  },
  SHIPPED: { 
    label: 'จัดส่งแล้ว', 
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'สินค้าของคุณถูกจัดส่งแล้ว'
  },
  DELIVERED: { 
    label: 'ได้รับสินค้าแล้ว', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'คุณได้รับสินค้าเรียบร้อยแล้ว'
  },
  CANCELLED: { 
    label: 'ยกเลิก', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'คำสั่งซื้อถูกยกเลิก'
  },
  REFUNDED: { 
    label: 'คืนเงินแล้ว', 
    color: 'bg-gray-100 text-gray-800',
    icon: RotateCcw,
    description: 'เงินได้รับการคืนแล้ว'
  }
}

const paymentStatusConfig = {
  PENDING: { label: 'รอการชำระ', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'ชำระไม่สำเร็จ', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'คืนเงินแล้ว', color: 'bg-gray-100 text-gray-800' }
}

const paymentMethodConfig = {
  CREDIT_CARD: 'บัตรเครดิต',
  PROMPTPAY: 'พร้อมเพย์',
  BANK_TRANSFER: 'โอนเงิน',
  COD: 'เก็บเงินปลายทาง',
  LINE_PAY: 'LINE Pay'
}

export default function PurchaseHistoryPage() {
  const { isInitialized, isLoggedIn, dbUser } = useLiff()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

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
        const response = await fetch(`/api/orders?userId=${dbUser.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        } else {
          console.error('Failed to fetch orders')
        }
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

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
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
              <p className="mt-4 text-orange-700">กำลังโหลดประวัติการสั่งซื้อ...</p>
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
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-orange-900">ประวัติการสั่งซื้อ</h1>
            </div>
            <p className="text-orange-700">ติดตามสถานะและประวัติการสั่งซื้อสินค้าของคุณ</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">คำสั่งซื้อทั้งหมด</p>
                    <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">สำเร็จแล้ว</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(order => order.status === 'DELIVERED').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ยอดรวม</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">ยังไม่มีการสั่งซื้อ</h3>
                  <p className="text-gray-500 mb-6">เริ่มช้อปปิ้งสินค้าที่คุณชื่นชอบได้เลย</p>
                  <Button 
                    onClick={() => router.push('/home')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    เริ่มช้อปปิ้ง
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status]
                const StatusIcon = statusInfo.icon
                const paymentInfo = paymentStatusConfig[order.paymentStatus]

                return (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
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
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-8 h-8 rounded object-cover"
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
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetail(order)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Order Detail Modal */}
          <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
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

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ข้อมูลคำสั่งซื้อ</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">เลขที่:</span> {selectedOrder.orderNumber}</p>
                        <p><span className="text-gray-500">วันที่สั่ง:</span> {formatDate(selectedOrder.createdAt)}</p>
                        <p><span className="text-gray-500">สถานะการชำระ:</span> 
                          <Badge className={`ml-2 ${paymentStatusConfig[selectedOrder.paymentStatus].color}`}>
                            {paymentStatusConfig[selectedOrder.paymentStatus].label}
                          </Badge>
                        </p>
                        {selectedOrder.paymentMethod && (
                          <p><span className="text-gray-500">วิธีการชำระ:</span> {paymentMethodConfig[selectedOrder.paymentMethod]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ข้อมูลการจัดส่ง</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{selectedOrder.address.name}</p>
                        <p>{selectedOrder.address.phone}</p>
                        <p className="text-gray-600">
                          {selectedOrder.address.address}<br />
                          {selectedOrder.address.district} {selectedOrder.address.subDistrict}<br />
                          {selectedOrder.address.province} {selectedOrder.address.postalCode}
                        </p>
                        {selectedOrder.trackingNumber && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-blue-800 font-medium">
                              หมายเลขติดตาม: {selectedOrder.trackingNumber}
                            </p>
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
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {item.product.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium">{item.product.name}</h5>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.total)}</p>
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
                        <span>ยอดรวมสินค้า</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ค่าจัดส่ง</span>
                        <span>{formatPrice(selectedOrder.shippingFee)}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between">
                          <span>ภาษี</span>
                          <span>{formatPrice(selectedOrder.tax)}</span>
                        </div>
                      )}
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>ส่วนลด</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>ยอดรวมสุทธิ</span>
                        <span className="text-orange-600">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">หมายเหตุ</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {selectedOrder.status === 'DELIVERED' && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          // Navigate to review page
                          setShowOrderDetail(false)
                          // router.push(`/review/${selectedOrder.id}`)
                        }}
                      >
                        <Star className="h-4 w-4" />
                        รีวิวสินค้า
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Contact support
                        alert('ติดต่อฝ่ายบริการลูกค้า')
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      ติดต่อเรา
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}