'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
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
  MessageSquare,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Camera,
  Play
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    image?: string
    images?: { imageUrl: string }[]
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

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'IMAGE' | 'VIDEO'
  uploading: boolean
  uploaded: boolean
  url?: string
  thumbnailUrl?: string
  duration?: number
  dimensions?: { width: number; height: number }
  error?: string
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
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<(OrderItem & { orderId?: string }) | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  // Media upload states
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)

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
        const response = await axios.get('/api/orders', { 
          params: { userId: dbUser.id } 
        })
        
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        if (axios.isAxiosError(error)) {
          console.error('Error response:', error.response?.data)
        }
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

  const handleReviewProduct = (orderItem: OrderItem, orderId: string) => {
    setSelectedProduct({ ...orderItem, orderId })
    setReviewRating(0)
    setReviewComment('')
    setMediaFiles([])
    setShowReviewModal(true)
    setShowOrderDetail(false)
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Check total files limit (max 5 files)
    if (mediaFiles.length + files.length > 5) {
      alert('สามารถอัปโหลดไฟล์ได้สูงสุด 5 ไฟล์')
      return
    }

    Array.from(files).forEach((file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพหรือวิดีโอ`)
        return
      }

      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด ${isImage ? '10MB' : '50MB'})`)
        return
      }

      // Create preview URL
      const preview = URL.createObjectURL(file)
      
      const mediaFile: MediaFile = {
        id: Date.now() + Math.random().toString(36),
        file,
        preview,
        type: isImage ? 'IMAGE' : 'VIDEO',
        uploading: false,
        uploaded: false
      }

      setMediaFiles(prev => [...prev, mediaFile])
    })

    // Reset input
    event.target.value = ''
  }

  // Remove media file
  const removeMediaFile = (fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // Upload media files
  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return []

    const uploadedUrls: string[] = []
    
    for (const mediaFile of mediaFiles) {
      if (mediaFile.uploaded && mediaFile.url) {
        uploadedUrls.push(mediaFile.url)
        continue
      }

      try {
        // Update uploading state
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { ...f, uploading: true, error: undefined } : f
        ))

        const formData = new FormData()
        formData.append('file', mediaFile.file)
        formData.append('type', mediaFile.type.toLowerCase())
        
        const response = await axios.post('/api/reviews/upload-media', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const uploadData = response.data
        uploadedUrls.push(uploadData.url)
        
        // Update uploaded state with complete data from API
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? { 
                ...f, 
                uploading: false, 
                uploaded: true, 
                url: uploadData.url,
                thumbnailUrl: uploadData.thumbnailUrl,
                duration: uploadData.duration,
                dimensions: uploadData.dimensions
              }
            : f
        ))
      } catch (error) {
        console.error('Error uploading media:', error)
        
        let errorMessage = 'ไม่ทราบสาเหตุ'
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
        
        // Update error state
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? { ...f, uploading: false, error: `อัปโหลดไม่สำเร็จ: ${errorMessage}` }
            : f
        ))
      }
    }

    return uploadedUrls
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct || !dbUser || reviewRating === 0) {
      alert('กรุณาให้คะแนนสินค้า')
      return
    }

    try {
      setSubmittingReview(true)
      
      // Temporarily skip media upload for testing
      console.log('Skipping media upload for testing...')
      
      const requestData = {
        userId: dbUser.id,
        productId: selectedProduct.product.id,
        orderId: selectedProduct.orderId,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
        mediaFiles: [] // Empty array for testing
      }

      console.log('Sending review data:', requestData)

      const response = await axios.post('/api/reviews', requestData)

      setShowReviewModal(false)
      setSelectedProduct(null)
      setReviewRating(0)
      setReviewComment('')
      setMediaFiles([])
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting review:', error)
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message
        if (error.response?.status === 403) {
          alert(errorMessage || 'คุณสามารถรีวิวได้เฉพาะสินค้าที่ได้รับแล้วเท่านั้น')
        } else if (error.response?.status === 409) {
          alert(errorMessage || 'คุณได้รีวิวสินค้านี้จากคำสั่งซื้อนี้แล้ว')
        } else if (error.response?.status === 400) {
          console.error('Validation error:', error.response?.data?.details)
          console.error('Full error response:', error.response?.data)
          alert(errorMessage || 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง')
        } else {
          alert(errorMessage || 'เกิดข้อผิดพลาดในการส่งรีวิว')
        }
      } else {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const getProductImageUrl = (product: OrderItem['product']) => {
    return product.images?.[0]?.imageUrl || product.image || undefined
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number, 
    onRatingChange?: (rating: number) => void,
    readonly?: boolean 
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Media Preview Component
  const MediaPreview = ({ mediaFile }: { mediaFile: MediaFile }) => {
    return (
      <div className="relative group">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          {mediaFile.type === 'IMAGE' ? (
            <img
              src={mediaFile.preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={mediaFile.preview}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-start justify-end p-2">
            <Button
              size="sm"
              variant="destructive"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => removeMediaFile(mediaFile.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* File Info */}
        <div className="mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {mediaFile.type === 'IMAGE' ? (
              <ImageIcon className="h-3 w-3" />
            ) : (
              <Video className="h-3 w-3" />
            )}
            <span>{formatFileSize(mediaFile.file.size)}</span>
          </div>
          
          {/* Upload Status */}
          {mediaFile.uploading && (
            <div className="flex items-center gap-1 text-blue-600 mt-1">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
              <span>กำลังอัปโหลด...</span>
            </div>
          )}
          
          {mediaFile.uploaded && (
            <div className="text-green-600 mt-1">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              อัปโหลดแล้ว
            </div>
          )}
          
          {mediaFile.error && (
            <div className="text-red-600 mt-1 text-wrap break-words">
              <XCircle className="h-3 w-3 inline mr-1" />
              {mediaFile.error}
            </div>
          )}
        </div>
      </div>
    )
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
                            {getProductImageUrl(item.product) && (
                              <img
                                src={getProductImageUrl(item.product)}
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
                          {getProductImageUrl(item.product) && (
                            <img
                              src={getProductImageUrl(item.product)}
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
                      <div className="space-y-2 w-full">
                        <h4 className="font-medium text-gray-900">รีวิวสินค้า</h4>
                        <div className="grid gap-2">
                          {selectedOrder.orderItems.map((item) => (
                            <Button
                              key={item.id}
                              variant="outline"
                              className="flex items-center justify-between p-3 h-auto"
                              onClick={() => handleReviewProduct(item, selectedOrder.id)}
                            >
                              <div className="flex items-center gap-3">
                                {getProductImageUrl(item.product) && (
                                  <img
                                    src={getProductImageUrl(item.product)}
                                    alt={item.product.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <span className="text-left">{item.product.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                <span className="text-sm">รีวิว</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
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

          {/* Review Modal */}
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  รีวิวสินค้า
                </DialogTitle>
                <DialogDescription>
                  แบ่งปันประสบการณ์การใช้งานสินค้าของคุณ พร้อมรูปภาพและวิดีโอ
                </DialogDescription>
              </DialogHeader>

              {selectedProduct && (
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getProductImageUrl(selectedProduct.product) && (
                      <img
                        src={getProductImageUrl(selectedProduct.product)}
                        alt={selectedProduct.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{selectedProduct.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        จำนวน: {selectedProduct.quantity} ชิ้น
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">ให้คะแนนสินค้า *</Label>
                    <div className="flex items-center gap-3">
                      <StarRating 
                        rating={reviewRating} 
                        onRatingChange={setReviewRating}
                      />
                      <span className="text-sm text-gray-500">
                        {reviewRating > 0 && (
                          reviewRating === 1 ? 'แย่มาก' :
                          reviewRating === 2 ? 'แย่' :
                          reviewRating === 3 ? 'ปานกลาง' :
                          reviewRating === 4 ? 'ดี' : 'ดีมาก'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="review-comment" className="text-base font-medium">
                      ความคิดเห็น (ไม่บังคับ)
                    </Label>
                    <Textarea
                      id="review-comment"
                      placeholder="แบ่งปันประสบการณ์การใช้งานสินค้าของคุณ..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {reviewComment.length}/500 ตัวอักษร
                    </p>
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">รูปภาพและวิดีโอ (ไม่บังคับ)</Label>
                      <span className="text-xs text-gray-500">{mediaFiles.length}/5 ไฟล์</span>
                    </div>

                    {/* Upload Button */}
                    {mediaFiles.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          id="media-upload"
                        />
                        <Label
                          htmlFor="media-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div className="flex items-center gap-4 text-gray-400">
                            <Camera className="h-8 w-8" />
                            <Upload className="h-8 w-8" />
                            <Video className="h-8 w-8" />
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-orange-600">คลิกเพื่ือเลือกไฟล์</span>
                            <br />
                            รองรับรูปภาพ (สูงสุด 10MB) และวิดีโอ (สูงสุด 50MB)
                          </div>
                        </Label>
                      </div>
                    )}

                    {/* Media Preview Grid */}
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mediaFiles.map((mediaFile) => (
                          <MediaPreview key={mediaFile.id} mediaFile={mediaFile} />
                        ))}
                      </div>
                    )}

                    {/* Upload Guidelines */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <h5 className="font-medium mb-1">คำแนะนำการอัปโหลด:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>รูปภาพ: JPG, PNG, GIF, WebP (สูงสุด 10MB)</li>
                        <li>วิดีโอ: MP4, WebM, MOV (สูงสุด 50MB)</li>
                        <li>สามารถอัปโหลดได้สูงสุด 5 ไฟล์</li>
                        <li>ควรถ่ายภาพสินค้าที่ชัดเจนและสว่างเพียงพอ</li>
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Clean up preview URLs when closing
                        mediaFiles.forEach(file => {
                          if (file.preview) {
                            URL.revokeObjectURL(file.preview)
                          }
                        })
                        setShowReviewModal(false)
                        setMediaFiles([])
                      }}
                      className="flex-1"
                      disabled={submittingReview || uploadingMedia}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      disabled={submittingReview || uploadingMedia || reviewRating === 0}
                    >
                      {submittingReview ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {uploadingMedia ? 'กำลังอัปโหลดไฟล์...' : 'กำลังส่งรีวิว...'}
                        </div>
                      ) : (
                        'ส่งรีวิว'
                      )}
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
                  รีวิวสำเร็จ!
                </DialogTitle>
                <DialogDescription>
                  ขอบคุณสำหรับการรีวิวสินค้า ความคิดเห็นและภาพของคุณจะช่วยให้ลูกค้าคนอื่นๆ ตัดสินใจได้ดีขึ้น
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Success Icon and Message */}
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    รีวิวของคุณถูกบันทึกแล้ว
                  </h3>
                  <p className="text-gray-600">
                    ขอบคุณที่แบ่งปันประสบการณ์และภาพการใช้งานสินค้า
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowSuccessModal(false)}
                    className="bg-green-500 hover:bg-green-600 px-8"
                  >
                    เรียบร้อย
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}