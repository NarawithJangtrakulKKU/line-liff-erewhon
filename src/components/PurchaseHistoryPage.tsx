'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
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
  Camera,
  X,
  FileImage,
  Video,
  Download
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
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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

// เพิ่ม interface สำหรับข้อมูลการรีวิว
interface ReviewStatus {
  productId: string
  orderId: string
  hasReviewed: boolean
  reviewId?: string
  rating?: number
  reviewDate?: string
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

// Utility function สำหรับ format ขนาดไฟล์
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ฟังก์ชันสำหรับแปลงค่า Decimal เป็น number อย่างปลอดภัย
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// ฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
const getFileTypeInfo = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
  return { isImage, isVideo, maxSize }
}

export default function PurchaseHistoryPage() {
  const { isInitialized, isLoggedIn, dbUser } = useLiff()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  
  // New states for media upload
  const [reviewMedia, setReviewMedia] = useState<File[]>([])
  const [mediaPreview, setMediaPreview] = useState<string[]>([])
  const [showMediaPreview, setShowMediaPreview] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  
  // เพิ่ม states สำหรับ upload progress
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  // เพิ่ม state สำหรับเก็บสถานะการรีวิว
  const [reviewStatuses, setReviewStatuses] = useState<ReviewStatus[]>([])
  const [loadingReviewStatuses, setLoadingReviewStatuses] = useState(false)

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
        const response = await axios.get(`/api/orders?userId=${dbUser.id}`)
        console.log('API Response:', response.data)
        console.log('Orders raw data:', response.data.orders)
        
        // ตรวจสอบข้อมูลแต่ละออเดอร์
        if (response.data.orders) {
          response.data.orders.forEach((order: Order, index: number) => {
            console.log(`Order ${index + 1}:`, {
              id: order.id,
              total: order.total,
              totalType: typeof order.total,
              isNaN: isNaN(Number(order.total))
            })
          })
        }
        
        setOrders(response.data.orders || [])
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

  // เพิ่มฟังก์ชันสำหรับโหลดสถานะการรีวิว
  const fetchReviewStatuses = useCallback(async () => {
    if (!dbUser || orders.length === 0) return

    try {
      setLoadingReviewStatuses(true)
      
      // รวบรวม productId และ orderId ทั้งหมดจากคำสั่งซื้อที่สถานะเป็น DELIVERED
      const deliveredOrders = orders.filter(order => order.status === 'DELIVERED')
      const reviewChecks = deliveredOrders.flatMap(order => 
        order.orderItems.map(item => ({
          productId: item.product.id,
          orderId: order.id
        }))
      )

      if (reviewChecks.length === 0) {
        setReviewStatuses([])
        return
      }

      const response = await axios.post('/api/reviews/status', {
        userId: dbUser.id,
        checks: reviewChecks
      })

      setReviewStatuses(response.data.reviewStatuses || [])
    } catch (error) {
      console.error('Error fetching review statuses:', error)
      // Don't show error to user, just log it - fallback to showing review buttons
      setReviewStatuses([])
    } finally {
      setLoadingReviewStatuses(false)
    }
  }, [dbUser, orders])

  // โหลดสถานะการรีวิวเมื่อมีข้อมูลคำสั่งซื้อ
  useEffect(() => {
    if (orders.length > 0) {
      fetchReviewStatuses()
    }
  }, [orders, fetchReviewStatuses])

  // ฟังก์ชันเพื่อเช็คว่าสินค้าถูกรีวิวแล้วหรือยัง
  const getReviewStatus = (productId: string, orderId: string): ReviewStatus | null => {
    const status = reviewStatuses.find(
      status => status.productId === productId && status.orderId === orderId
    ) || null
    
    return status
  }

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleReviewProduct = (orderItem: OrderItem, orderId: string) => {
    // เช็คว่าสินค้านี้ถูกรีวิวแล้วหรือยัง
    const reviewStatus = getReviewStatus(orderItem.product.id, orderId)
    
    if (reviewStatus?.hasReviewed) {
      // แสดงข้อความที่เป็นมิตรกับผู้ใช้มากขึ้น
      alert(`คุณได้รีวิวสินค้า "${orderItem.product.name}" แล้ว\nให้คะแนน ${reviewStatus.rating} ดาว`)
      return
    }

    // ตรวจสอบว่าคำสั่งซื้อเป็น DELIVERED หรือไม่
    const order = orders.find(o => o.id === orderId)
    if (!order || order.status !== 'DELIVERED') {
      alert('คุณสามารถรีวิวได้เฉพาะสินค้าที่ได้รับแล้วเท่านั้น')
      return
    }

    setSelectedProduct({ ...orderItem, orderId })
    setReviewRating(0)
    setReviewComment('')
    // Reset media states
    setReviewMedia([])
    setMediaPreview([])
    setShowReviewModal(true)
    setShowOrderDetail(false)
  }

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate files
    for (const file of Array.from(files)) {
      const { isImage, isVideo, maxSize } = getFileTypeInfo(file)
      
      if (!isImage && !isVideo) {
        alert('กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น')
        return
      }
      
      // Check file size (max 50MB for videos, 10MB for images)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const maxSizeMB = isVideo ? '50MB' : '10MB'
      
      if (file.size > maxSize) {
        alert(`ขนาดไฟล์ ${file.name} (${fileSizeMB}MB) เกินกำหนด\nไฟล์${isVideo ? 'วิดีโอ' : 'รูปภาพ'}ต้องไม่เกิน ${maxSizeMB}`)
        return
      }
      
      // Warning for large video files
      if (isVideo && file.size > 20 * 1024 * 1024) {
        const proceed = confirm(
          `ไฟล์วิดีโอ "${file.name}" มีขนาด ${fileSizeMB}MB\n` +
          'การอัปโหลดอาจใช้เวลานาน คุณต้องการดำเนินการต่อหรือไม่?'
        )
        if (!proceed) return
      }
    }

    // Check total files limit (max 5 files)
    if (reviewMedia.length + files.length > 5) {
      alert('สามารถอัปโหลดได้สูงสุด 5 ไฟล์')
      return
    }

    const newFiles = Array.from(files)
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    
    setReviewMedia(prev => [...prev, ...newFiles])
    setMediaPreview(prev => [...prev, ...newPreviewUrls])
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.setAttribute('accept', 'image/*,video/*')
      fileInputRef.current.click()
    }
  }

  const removeMedia = (index: number) => {
    // Revoke object URL to free memory
    if (mediaPreview[index].startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview[index])
    }
    
    setReviewMedia(prev => prev.filter((_, i) => i !== index))
    setMediaPreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct || !dbUser || reviewRating === 0) {
      alert('กรุณาให้คะแนนสินค้า')
      return
    }

    console.log('Submitting review with data:', {
      userId: dbUser.id,
      productId: selectedProduct.product.id,
      orderId: selectedProduct.orderId,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
      mediaCount: reviewMedia.length
    })

    try {
      setSubmittingReview(true)
      setUploadProgress(0)
      setUploadStatus('กำลังเตรียมข้อมูล...')
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('userId', dbUser.id)
      formData.append('productId', selectedProduct.product.id)
      formData.append('orderId', selectedProduct.orderId || '')
      formData.append('rating', reviewRating.toString())
      formData.append('comment', reviewComment.trim() || '')
      
      // Add media files with progress tracking
      if (reviewMedia.length > 0) {
        setUploadStatus(`กำลังเตรียมไฟล์ ${reviewMedia.length} ไฟล์...`)
        reviewMedia.forEach((file, index) => {
          formData.append(`media-${index}`, file)
        })
        setUploadProgress(20)
      }

      setUploadStatus('กำลังอัปโหลด...')
      setUploadProgress(30)

      const response = await axios.post('/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      })

      setUploadProgress(80)
      setUploadStatus('กำลังประมวลผล...')

      console.log('API response:', { status: response.status, data: response.data })

      setUploadProgress(100)
      setUploadStatus('เสร็จสิ้น!')

      setShowReviewModal(false)
      setSelectedProduct(null)
      setReviewRating(0)
      setReviewComment('')
      // Clean up media
      mediaPreview.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      setReviewMedia([])
      setMediaPreview([])
      setShowSuccessModal(true)
      
      // อัปเดตสถานะการรีวิวหลังจากส่งรีวิวสำเร็จ
      fetchReviewStatuses()
    } catch (error) {
      console.error('Error submitting review:', error)
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          alert('การอัปโหลดใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง หรือลดขนาดไฟล์')
        } else if (error.response) {
          // Handle specific error status codes
          const status = error.response.status
          const message = error.response.data?.message
          
          if (status === 403) {
            alert(message || 'คุณสามารถรีวิวได้เฉพาะสินค้าที่ได้รับแล้วเท่านั้น')
          } else if (status === 413) {
            alert('ไฟล์มีขนาดใหญ่เกินไป กรุณาลดขนาดไฟล์หรือเลือกไฟล์อื่น')
          } else if (status === 408 || status === 504) {
            alert('การอัปโหลดใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง')
          } else {
            alert(message || 'เกิดข้อผิดพลาดในการส่งรีวิว')
          }
        } else if (error.request) {
          alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
        } else {
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
        }
      } else {
        alert('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setSubmittingReview(false)
      setUploadProgress(0)
      setUploadStatus('')
    }
  }

  const getProductImageUrl = (product: OrderItem['product']) => {
    return product.images?.[0]?.imageUrl || product.image || ''
  }

  const formatPrice = (price: number | string | null | undefined) => {
    // ใช้ safeNumber เพื่อแปลงค่าให้ปลอดภัย
    const numPrice = safeNumber(price)
    
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(numPrice)
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

  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'default' }: { 
    rating: number, 
    onRatingChange?: (rating: number) => void,
    readonly?: boolean,
    size?: 'small' | 'default'
  }) => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-6 w-6'
    
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
              className={`${starSize} ${
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
                      {formatPrice(orders.reduce((sum, order) => sum + safeNumber(order.total), 0))}
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
                            {order.orderItems.reduce((sum, item) => sum + safeNumber(item.quantity), 0)} ชิ้น
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
                        {order.orderItems.slice(0, 2).map((item) => {
                          const imageUrl = getProductImageUrl(item.product)
                          return (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              {imageUrl && imageUrl !== '' && (
                                <Image
                                  src={imageUrl}
                                  alt={item.product.name}
                                  width={32}
                                  height={32}
                                  className="rounded-lg"
                                />
                              )}
                              <span className="flex-1">{item.product.name}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                              <span className="font-medium">{formatPrice(item.total)}</span>
                            </div>
                          )
                        })}
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
                      {selectedOrder.orderItems.map((item) => {
                        const reviewStatus = getReviewStatus(item.product.id, selectedOrder.id)
                        const hasReviewed = reviewStatus?.hasReviewed === true
                        const imageUrl = getProductImageUrl(item.product)
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              hasReviewed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:border-orange-300 cursor-pointer'
                            }`}
                            onClick={hasReviewed ? undefined : () => handleReviewProduct(item, selectedOrder.id)}
                          >
                            <div className="flex items-center gap-3">
                              {imageUrl && imageUrl !== '' && (
                                <Image
                                  src={imageUrl}
                                  alt={item.product.name}
                                  width={32}
                                  height={32}
                                  className="rounded-lg"
                                />
                              )}
                              <span className="text-left">{item.product.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {hasReviewed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <div className="text-right">
                                    <div className="flex items-center gap-1">
                                      <StarRating 
                                        rating={reviewStatus?.rating || 0} 
                                        readonly={true}
                                        size="small"
                                      />
                                    </div>
                                    <span className="text-sm text-green-700 font-medium">
                                      คุณรีวิวแล้ว
                                    </span>
                                    {reviewStatus?.reviewDate && (
                                      <div className="text-xs text-green-600 mt-1">
                                        {new Date(reviewStatus.reviewDate).toLocaleDateString('th-TH', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : loadingReviewStatuses ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                                  <span className="text-sm text-gray-500">กำลังตรวจสอบ...</span>
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm text-orange-600 font-medium">
                                    รีวิว
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
                          {selectedOrder.orderItems.map((item) => {
                            const reviewStatus = getReviewStatus(item.product.id, selectedOrder.id)
                            const hasReviewed = reviewStatus?.hasReviewed === true
                            const imageUrl = getProductImageUrl(item.product)
                            
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  hasReviewed 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200 hover:border-orange-300 cursor-pointer'
                                }`}
                                onClick={hasReviewed ? undefined : () => handleReviewProduct(item, selectedOrder.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {imageUrl && imageUrl !== '' && (
                                    <Image
                                      src={imageUrl}
                                      alt={item.product.name}
                                      width={32}
                                      height={32}
                                      className="rounded-lg"
                                    />
                                  )}
                                  <span className="text-left">{item.product.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {hasReviewed ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <div className="text-right">
                                        <div className="flex items-center gap-1">
                                          <StarRating 
                                            rating={reviewStatus?.rating || 0} 
                                            readonly={true}
                                            size="small"
                                          />
                                        </div>
                                        <span className="text-sm text-green-700 font-medium">
                                          คุณรีวิวแล้ว
                                        </span>
                                        {reviewStatus?.reviewDate && (
                                          <div className="text-xs text-green-600 mt-1">
                                            {new Date(reviewStatus.reviewDate).toLocaleDateString('th-TH', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric'
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : loadingReviewStatuses ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                                      <span className="text-sm text-gray-500">กำลังตรวจสอบ...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Star className="h-4 w-4 text-orange-500" />
                                      <span className="text-sm text-orange-600 font-medium">
                                        รีวิว
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
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
                  แบ่งปันประสบการณ์การใช้งานสินค้าของคุณ
                </DialogDescription>
              </DialogHeader>

              {selectedProduct && (
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const imageUrl = getProductImageUrl(selectedProduct.product)
                      return imageUrl && imageUrl !== '' && (
                        <Image
                          src={imageUrl}
                          alt={selectedProduct.product.name}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      )
                    })()}
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

                  {/* Media Upload Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">รูปภาพและวิดีโอ (ไม่บังคับ)</Label>
                    
                    {/* Media Preview Grid */}
                    {mediaPreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {mediaPreview.map((preview, index) => {
                          const file = reviewMedia[index]
                          const { isVideo } = getFileTypeInfo(file)
                          
                          return (
                            <div key={index} className="relative group">
                              {isVideo ? (
                                <div className="relative">
                                  <video
                                    src={preview}
                                    className="w-full h-24 object-cover rounded-lg border"
                                    muted
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                                    <Video className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={preview}
                                  alt={`Review image ${index + 1}`}
                                  width={96}
                                  height={96}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                              )}
                              
                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                                  onClick={() => {
                                    setSelectedMediaIndex(index)
                                    setShowMediaPreview(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeMedia(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* File type indicator */}
                              <div className="absolute bottom-1 left-1">
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  {isVideo ? 'วิดีโอ' : 'รูปภาพ'}
                                </Badge>
                              </div>
                              
                              {/* File size indicator */}
                              <div className="absolute bottom-1 right-1">
                                <Badge variant="secondary" className="text-xs px-1 py-0 bg-black/50 text-white">
                                  {formatFileSize(file.size)}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Upload Area */}
                    {mediaPreview.length < 5 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                        <div className="space-y-3">
                          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">อัปโหลดรูปภาพหรือวิดีโอ</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              รองรับ: JPG, PNG, GIF, MP4, MOV (รูปภาพ ≤10MB, วิดีโอ ≤50MB)
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              สูงสุด 5 ไฟล์ (เหลือ {5 - mediaPreview.length} ไฟล์)
                            </p>
                            {reviewMedia.some(file => getFileTypeInfo(file).isVideo) && (
                              <p className="text-xs text-amber-600 mt-1 font-medium">
                                ⚠️ วิดีโอขนาดใหญ่อาจใช้เวลาอัปโหลดนาน
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <FileImage className="h-4 w-4" />
                              เลือกไฟล์
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCameraCapture}
                              className="flex items-center gap-2"
                            >
                              <Camera className="h-4 w-4" />
                              ถ่ายรูป/วิดีโอ
                            </Button>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReviewModal(false)
                        // Clean up media on cancel
                        mediaPreview.forEach(url => {
                          if (url.startsWith('blob:')) {
                            URL.revokeObjectURL(url)
                          }
                        })
                        setReviewMedia([])
                        setMediaPreview([])
                      }}
                      className="flex-1"
                      disabled={submittingReview}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      disabled={submittingReview || reviewRating === 0}
                    >
                      {submittingReview ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          กำลังส่ง...
                        </div>
                      ) : (
                        'ส่งรีวิว'
                      )}
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {submittingReview && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{uploadStatus}</span>
                        <span className="text-gray-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      {uploadProgress < 100 && (
                        <p className="text-xs text-gray-500 text-center">
                          {reviewMedia.some(file => file.type.startsWith('video/')) 
                            ? 'การอัปโหลดวิดีโออาจใช้เวลาสักครู่ กรุณารอสักครู่...' 
                            : 'กำลังประมวลผล...'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Media Preview Modal */}
          <Dialog open={showMediaPreview} onOpenChange={setShowMediaPreview}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  ดูตัวอย่างไฟล์
                </DialogTitle>
                <DialogDescription>
                  ไฟล์ที่ {selectedMediaIndex + 1} จาก {mediaPreview.length}
                </DialogDescription>
              </DialogHeader>
              
              {mediaPreview[selectedMediaIndex] && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    {reviewMedia[selectedMediaIndex]?.type.startsWith('video/') ? (
                      <video
                        src={mediaPreview[selectedMediaIndex]}
                        controls
                        className="w-full max-h-96 rounded-lg"
                      />
                    ) : (
                      <Image
                        src={mediaPreview[selectedMediaIndex]}
                        alt={`Preview ${selectedMediaIndex + 1}`}
                        width={384}
                        height={384}
                        className="w-full max-h-96 object-contain rounded-lg"
                      />
                    )}
                  </div>
                  
                  {/* Navigation */}
                  {mediaPreview.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMediaIndex(prev => prev > 0 ? prev - 1 : mediaPreview.length - 1)}
                      >
                        ก่อนหน้า
                      </Button>
                      <span className="text-sm text-gray-500">
                        {selectedMediaIndex + 1} / {mediaPreview.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMediaIndex(prev => prev < mediaPreview.length - 1 ? prev + 1 : 0)}
                      >
                        ถัดไป
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = mediaPreview[selectedMediaIndex]
                        link.download = `review-media-${selectedMediaIndex + 1}.${reviewMedia[selectedMediaIndex]?.type.startsWith('video/') ? 'mp4' : 'jpg'}`
                        link.click()
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      ดาวน์โหลด
                    </Button>
                    <Button 
                      onClick={() => setShowMediaPreview(false)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      ปิด
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
                  ขอบคุณสำหรับการรีวิวสินค้า ความคิดเห็นของคุณจะช่วยให้ลูกค้าคนอื่นๆ ตัดสินใจได้ดีขึ้น
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
                    ขอบคุณที่แบ่งปันประสบการณ์การใช้งานสินค้า
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