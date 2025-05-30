'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLiff } from '@/app/contexts/LiffContext'
import { 
  ArrowLeft,
  Upload,
  Camera,
  X,
  AlertCircle,
  FileImage,
  Eye,
  Download,
  Copy,
  CheckCircle,
  Package,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import axios from 'axios'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    images: Array<{
      imageUrl: string
    }>
  }
}

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  notes?: string
  createdAt: string
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

interface PaymentPageProps {
  orderId: string
}

export default function PaymentPage({ orderId }: PaymentPageProps) {
  const { dbUser, profile, isInitialized, isLoggedIn } = useLiff()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [slipImage, setSlipImage] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !isInitialized) return
      
      try {
        setLoading(true)
        console.log('Fetching order details for orderId:', orderId)
        
        const response = await axios.get(`/api/orders?orderId=${orderId}`)
        console.log('API Response:', response.data)
        
        if (response.data.success) {
          setOrderDetails(response.data.order)
        } else {
          console.error('Failed to fetch order details:', response.data)
          alert(`ไม่พบข้อมูลคำสั่งซื้อ: ${response.data.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data)
          console.error('Response status:', error.response?.status)
          
          if (error.response?.status === 404) {
            alert(`ไม่พบคำสั่งซื้อที่มี ID: ${orderId}`)
          } else {
            alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`)
          }
        } else {
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, isInitialized])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 10MB')
      return
    }

    setSlipImage(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setSlipPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const removeImage = () => {
    setSlipImage(null)
    setSlipPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const submitPaymentProof = async () => {
    if (!slipImage) {
      alert('กรุณาอัปโหลดหลักฐานการโอนเงิน')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('slip', slipImage)
      formData.append('orderId', orderId)
      formData.append('userId', dbUser?.id || '')
      formData.append('notes', notes)

      const response = await axios.post('/api/payment/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setUploadSuccess(true)
        router.push(`/paymentsuccess?orderId=${orderId}`)
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error)
      alert('เกิดข้อผิดพลาดในการส่งหลักฐานการโอนเงิน')
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'PROMPTPAY':
        return 'พร้อมเพย์'
      case 'LINE_PAY':
        return 'LINE Pay'
      case 'BANK_TRANSFER':
        return 'โอนเงินธนาคาร'
      case 'CREDIT_CARD':
        return 'บัตรเครดิต'
      case 'COD':
        return 'เก็บเงินปลายทาง'
      default:
        return 'ไม่ระบุ'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอดำเนินการ</Badge>
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">ยืนยันแล้ว</Badge>
      case 'PROCESSING':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">กำลังเตรียม</Badge>
      case 'SHIPPED':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">จัดส่งแล้ว</Badge>
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ส่งมอบแล้ว</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ยกเลิก</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">รอชำระ</Badge>
      case 'PAID':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ชำระแล้ว</Badge>
      case 'FAILED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ชำระไม่สำเร็จ</Badge>
      case 'REFUNDED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">คืนเงินแล้ว</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-orange-100 rounded-md"></div>
            <div className="h-96 bg-orange-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาล็อกอิน</h1>
            <p className="text-gray-600 mb-8">กรุณาล็อกอินเพื่อดำเนินการต่อ</p>
            <Button 
              onClick={() => router.push('/')} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105"
            >
              กลับไปหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลคำสั่งซื้อ</h1>
            <p className="text-gray-600 mb-8">ไม่สามารถดึงข้อมูลคำสั่งซื้อได้</p>
            <Button 
              onClick={() => router.push('/myorders')} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105"
            >
              กลับไปหน้าคำสั่งซื้อ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-orange-100 rounded-full px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              ชำระเงิน
            </h1>
          </div>

          {/* Success Alert */}
          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50 rounded-xl shadow-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-semibold">ส่งหลักฐานการโอนเงินเรียบร้อย</AlertTitle>
              <AlertDescription className="text-green-700">
                เรากำลังตรวจสอบการชำระเงินของคุณ จะแจ้งผลภายใน 10-15 นาที
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Order Summary */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-orange-500" />
              </div>
              สรุปคำสั่งซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50/50 rounded-xl">
              <div>
                <Label className="text-sm font-medium text-gray-600">เลขที่คำสั่งซื้อ</Label>
                <p className="text-lg font-semibold text-gray-900">{orderDetails.orderNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">สถานะ</Label>
                <div className="mt-1">
                  {getStatusBadge(orderDetails.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">สถานะการชำระเงิน</Label>
                <div className="mt-1">
                  {getPaymentStatusBadge(orderDetails.paymentStatus)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">วิธีการชำระเงิน</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {orderDetails.paymentMethod ? getPaymentMethodName(orderDetails.paymentMethod) : 'ไม่ระบุ'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                รายการสินค้า ({orderDetails.orderItems.length} รายการ)
              </h3>
              <div className="space-y-3">
                {orderDetails.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    {item.product.images && item.product.images.length > 0 && (
                      <Image
                        src={item.product.images[0].imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>จำนวน: {item.quantity}</span>
                        <span>ราคา: {formatCurrency(item.price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>ยอดรวมสินค้า</span>
                <span>{formatCurrency(orderDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>{formatCurrency(orderDetails.shippingFee)}</span>
              </div>
              {orderDetails.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ภาษี</span>
                  <span>{formatCurrency(orderDetails.tax)}</span>
                </div>
              )}
              {orderDetails.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด</span>
                  <span>-{formatCurrency(orderDetails.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-orange-600">{formatCurrency(orderDetails.total)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">ที่อยู่จัดส่ง</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">{orderDetails.address.name}</p>
                <p>{orderDetails.address.phone}</p>
                <p>
                  {orderDetails.address.address} {orderDetails.address.subDistrict} {orderDetails.address.district} {orderDetails.address.province} {orderDetails.address.postalCode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                <Image
                  src="/images/qrcodepropmtpay/narawith_qrcode.jpeg"
                  alt="QR Code for payment"
                  width={256}
                  height={256}
                  className="w-64 h-64 object-contain rounded-lg"
                />
              </div>
              <div className="text-center space-y-2">
                <div className="text-xl font-semibold text-teal-700 mb-2">สแกน QR เพื่อโอนเข้าบัญชี</div>
                <div className="bg-teal-50 rounded-xl p-4 space-y-2">
                  <div className="text-gray-700 font-medium">ชื่อ: นาย นราวิชญ์ จังตระกูล</div>
                  <div className="text-gray-700 font-medium">บัญชี: xxx-x-x7795-x</div>
                  <div className="text-teal-600 text-sm font-medium">เลขอ้างอิง: {orderDetails.orderNumber}</div>
                  <div className="text-lg font-bold text-orange-600">จำนวนเงิน: {formatCurrency(orderDetails.total)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(orderDetails.orderNumber)}
                  className="mt-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขอ้างอิง'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Slip Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FileImage className="h-5 w-5 text-orange-500" />
              </div>
              อัปโหลดหลักฐานการโอนเงิน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            {!slipPreview ? (
              <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors bg-orange-50/50">
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <Upload className="h-10 w-10 text-orange-500" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      อัปโหลดสลิปการโอนเงิน
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 10MB)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      เลือกไฟล์
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCameraCapture}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      ถ่ายรูป
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              /* Image Preview */
              <div className="space-y-4">
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slipPreview}
                    alt="Payment slip preview"
                    className="w-full max-h-80 object-contain rounded-xl border shadow-sm"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowImagePreview(true)}
                      className="bg-white/90 hover:bg-white shadow-md"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="bg-red-500/90 hover:bg-red-500 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    ไฟล์: {slipImage?.name} ({((slipImage?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 font-medium">หมายเหตุ (ไม่บังคับ)</Label>
              <Textarea
                id="notes"
                placeholder="เพิ่มหมายเหตุเกี่ยวกับการโอนเงิน เช่น เวลาที่โอน ธนาคารที่โอน เป็นต้น"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={submitPaymentProof}
                disabled={!slipImage || uploading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังส่งหลักฐาน...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    ส่งหลักฐานการโอนเงิน
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">หลักฐานการโอนเงิน</DialogTitle>
              <DialogDescription className="text-gray-600">
                ตรวจสอบความชัดเจนของหลักฐานการโอนเงินก่อนส่ง
              </DialogDescription>
            </DialogHeader>
            {slipPreview && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slipPreview}
                    alt="Payment slip full view"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = slipPreview
                      link.download = `payment-slip-${orderId}.jpg`
                      link.click()
                    }}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลด
                  </Button>
                  <Button 
                    onClick={() => setShowImagePreview(false)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    ปิด
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}