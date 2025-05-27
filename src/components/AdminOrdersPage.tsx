'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Eye, Edit, Trash2, Plus, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    imageUrl?: string
  }
}

interface Address {
  id: string
  name: string
  phone: string
  address: string
  district: string
  subDistrict: string
  province: string
  postalCode: string
}

interface User {
  id: string
  displayName: string
  pictureUrl?: string
  lineUserId: string
}

interface Order {
  id: string
  orderNumber: string
  userId: string
  addressId: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  shippingMethod?: string
  paymentSlipUrl?: string
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
  user: User
  address: Address
  orderItems: OrderItem[]
}

interface OrderFormData {
  status: string
  paymentStatus: string
  paymentMethod?: string
  shippingMethod?: string
  trackingNumber?: string
  notes?: string
}

// Status configurations
const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
]

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'FAILED', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
]

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'PROMPTPAY', label: 'PromptPay' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'LINE_PAY', label: 'LINE Pay' },
]

const SHIPPING_METHODS = [
  { value: 'TH_POST', label: 'Thailand Post' },
  { value: 'TH_EXPRESS', label: 'Thailand Express' },
]

// Helper functions
const getStatusConfig = (status: string) => {
  return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0]
}

const getPaymentStatusConfig = (status: string) => {
  return PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Order Details Modal Component
const OrderDetailsModal = React.memo(({ 
  order, 
  isOpen, 
  onClose 
}: { 
  order: Order | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!order) return null

  const statusConfig = getStatusConfig(order.status)
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {formatDate(order.updatedAt)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {order.user.pictureUrl && (
                      <img
                        src={order.user.pictureUrl}
                        alt={order.user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{order.user.displayName}</p>
                      <p className="text-sm text-gray-500">{order.user.lineUserId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-red-600">-{formatCurrency(order.discount)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Items ({order.orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="text-sm">Price: {formatCurrency(item.price)}</span>
                          <span className="text-sm font-medium">Total: {formatCurrency(item.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Shipping Address</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded">
                      <p className="font-medium">{order.address.name}</p>
                      <p className="text-sm">{order.address.phone}</p>
                      <p className="text-sm mt-1">
                        {order.address.address}, {order.address.district}, {order.address.subDistrict}
                      </p>
                      <p className="text-sm">
                        {order.address.province} {order.address.postalCode}
                      </p>
                    </div>
                  </div>

                  {order.shippingMethod && (
                    <div>
                      <Label className="text-sm font-medium">Shipping Method</Label>
                      <p className="text-sm mt-1">
                        {SHIPPING_METHODS.find(m => m.value === order.shippingMethod)?.label || order.shippingMethod}
                      </p>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div>
                      <Label className="text-sm font-medium">Tracking Number</Label>
                      <p className="text-sm mt-1 font-mono">{order.trackingNumber}</p>
                    </div>
                  )}

                  {order.shippedAt && (
                    <div>
                      <Label className="text-sm font-medium">Shipped At</Label>
                      <p className="text-sm mt-1">{formatDate(order.shippedAt)}</p>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div>
                      <Label className="text-sm font-medium">Delivered At</Label>
                      <p className="text-sm mt-1">{formatDate(order.deliveredAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <div className="mt-1">
                      <Badge className={paymentConfig.color}>
                        {paymentConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {order.paymentMethod && (
                    <div>
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <p className="text-sm mt-1">
                        {PAYMENT_METHODS.find(m => m.value === order.paymentMethod)?.label || order.paymentMethod}
                      </p>
                    </div>
                  )}

                  {order.paymentSlipUrl && (
                    <div>
                      <Label className="text-sm font-medium">Payment Slip</Label>
                      <div className="mt-1">
                        <img
                          src={order.paymentSlipUrl}
                          alt="Payment slip"
                          className="max-w-xs border rounded"
                        />
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

OrderDetailsModal.displayName = 'OrderDetailsModal'

// Edit Order Modal Component
const EditOrderModal = React.memo(({
  order,
  isOpen,
  onClose,
  onSave,
  submitting
}: {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: OrderFormData) => void
  submitting: boolean
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    shippingMethod: '',
    trackingNumber: '',
    notes: ''
  })

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || '',
        shippingMethod: order.shippingMethod || '',
        trackingNumber: order.trackingNumber || '',
        notes: order.notes || ''
      })
    }
  }, [order])

  const handleSubmit = () => {
    onSave(formData)
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Update order information and status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Order Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={formData.paymentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shippingMethod">Shipping Method</Label>
            <Select value={formData.shippingMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, shippingMethod: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
              placeholder="Enter tracking number"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter additional notes"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

EditOrderModal.displayName = 'EditOrderModal'

// Main Component
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success')

  const showNotification = useCallback((type: 'success' | 'error', title: string, message: string) => {
    setNotificationType(type)
    setNotificationTitle(title)
    setNotificationMessage(message)
    setShowNotificationModal(true)
  }, [])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/orders')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to fetch orders"
          : "An error occurred while fetching orders"
      )
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // Handle view order
  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }, [])

  // Handle edit order
  const handleEditOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsEditModalOpen(true)
  }, [])

  // Handle update order
  const handleUpdateOrder = useCallback(async (formData: OrderFormData) => {
    if (!selectedOrder) return

    try {
      setSubmitting(true)
      const response = await axios.put(`/api/admin/orders/${selectedOrder.id}`, formData)
      
      setOrders(prev => 
        prev.map(order => order.id === selectedOrder.id ? response.data.order : order)
      )
      setIsEditModalOpen(false)
      setSelectedOrder(null)
      showNotification('success', 'Success', 'Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update order"
          : "An error occurred while updating order"
      )
    } finally {
      setSubmitting(false)
    }
  }, [selectedOrder, showNotification])

  // Handle delete order
  const handleDeleteOrder = useCallback(async (orderId: string) => {
    try {
      await axios.delete(`/api/admin/orders/${orderId}`)
      setOrders(prev => prev.filter(order => order.id !== orderId))
      showNotification('success', 'Success', 'Order deleted successfully')
    } catch (error) {
      console.error('Error deleting order:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete order"
          : "An error occurred while deleting order"
      )
    }
  }, [showNotification])

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length
    const completedOrders = orders.filter(order => order.status === 'DELIVERED').length
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.total, 0)

    return { totalOrders, pendingOrders, completedOrders, totalRevenue }
  }, [orders])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders by number, customer, or recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>
                Manage all customer orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-gray-400 text-lg mb-2">No orders found</div>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'No orders have been placed yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status)
                        const paymentConfig = getPaymentStatusConfig(order.paymentStatus)
                        const StatusIcon = statusConfig.icon

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{order.orderNumber}</div>
                                <div className="text-sm text-gray-500">{order.orderItems.length} items</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {order.user.pictureUrl && (
                                  <img
                                    src={order.user.pictureUrl}
                                    alt={order.user.displayName}
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{order.user.displayName}</div>
                                  <div className="text-sm text-gray-500">{order.address.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={paymentConfig.color}>
                                {paymentConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(order.total)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(order.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete order "{order.orderNumber}"? This action cannot be undone.
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                          <strong>Warning:</strong> This will permanently delete the order and all associated data.
                                        </div>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details Modal */}
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false)
              setSelectedOrder(null)
            }}
          />

          {/* Edit Order Modal */}
          <EditOrderModal
            order={selectedOrder}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedOrder(null)
            }}
            onSave={handleUpdateOrder}
            submitting={submitting}
          />

          {/* Notification Modal */}
          <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className={`flex items-center gap-2 ${
                  notificationType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {notificationType === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {notificationTitle}
                </DialogTitle>
                <DialogDescription>
                  {notificationMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  onClick={() => setShowNotificationModal(false)}
                  className={
                    notificationType === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}