'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'
import { 
  ArrowLeft,
  QrCode,
  Upload,
  Camera,
  Check,
  X,
  Clock,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  FileImage,
  Eye,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import axios from 'axios'

interface PaymentDetails {
  orderId: string
  orderNumber: string
  amount: number
  paymentMethod: string
  qrCodeUrl?: string
  bankAccount?: {
    bank: string
    accountNumber: string
    accountName: string
  }
  expiresAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
}

interface PaymentPageProps {
  orderId: string
}

export default function PaymentPage({ orderId }: PaymentPageProps) {
  const { dbUser, profile, isInitialized, isLoggedIn } = useLiff()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (isInitialized) {
      setLoading(false)
    }
  }, [isInitialized])

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
        router.push(`/home`)
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'promptpay':
        return <Smartphone className="h-5 w-5" />
      case 'line_pay':
        return <CreditCard className="h-5 w-5" />
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'promptpay':
        return 'พร้อมเพย์'
      case 'line_pay':
        return 'LINE Pay'
      case 'bank_transfer':
        return 'โอนเงินธนาคาร'
      default:
        return 'ไม่ระบุ'
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
              อัปโหลดหลักฐานการโอนเงิน
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

        {/* QR Code Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                <img
                  src="/images/qrcodepropmtpay/narawith_qrcode.jpeg"
                  alt="QR Code for payment"
                  className="w-64 h-64 object-contain rounded-lg"
                />
              </div>
              <div className="text-center space-y-2">
                <div className="text-xl font-semibold text-teal-700 mb-2">สแกน QR เพื่อโอนเข้าบัญชี</div>
                <div className="bg-teal-50 rounded-xl p-4 space-y-2">
                  <div className="text-gray-700 font-medium">ชื่อ: นาย นราวิชญ์ จังตระกูล</div>
                  <div className="text-gray-700 font-medium">บัญชี: xxx-x-x7795-x</div>
                  <div className="text-teal-600 text-sm font-medium">เลขอ้างอิง: 004999059406156</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('004999059406156')}
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
                    ไฟล์: {slipImage?.name} ({(slipImage?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full"
                  >
                    เปลี่ยนรูป
                  </Button>
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