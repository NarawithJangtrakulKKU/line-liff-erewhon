'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'
import { 
  CheckCircle,
  Home,
  ShoppingCart,
  Package,
  Clock,
  Star,
  Share2,
  Gift,
  Truck,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
// Temporarily comment out confetti until package is installed
// import confetti from 'canvas-confetti'

export default function PaymentSuccess() {
  const { profile, isInitialized, isLoggedIn } = useLiff()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAnimation, setShowAnimation] = useState(false)
  
  // Get order details from URL params (optional)
  const orderNumber = searchParams.get('orderNumber') || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  const amount = searchParams.get('amount') || '1,299'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Show confetti animation on mount
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      setShowAnimation(true)
      
      // Temporarily comment out confetti until package is installed
      // const timer = setTimeout(() => {
      //   confetti({
      //     particleCount: 100,
      //     spread: 70,
      //     origin: { y: 0.6 },
      //     colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
      //   })
      // }, 500)

      // return () => clearTimeout(timer)
    }
  }, [isInitialized, isLoggedIn])

  const handleGoHome = () => {
    router.push('/home')
  }

  const handleViewOrders = () => {
    router.push('/purchase-history')
  }

  const handleShareSuccess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'สั่งซื้อสำเร็จ - EREWHON SHOP',
          text: `ฉันเพิ่งสั่งซื้อสินค้าจาก EREWHON SHOP เรียบร้อยแล้ว! 🛍️`,
          url: window.location.origin
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  const handleContactSupport = () => {
    // Open LINE chat or phone
    window.open('tel:02-123-4567')
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20 flex items-center justify-center">
        <div className="animate-pulse space-y-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-8 w-48 bg-gray-200 rounded-md mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ชำระเงินสำเร็จ!</h1>
            <p className="text-gray-600 mb-6">การสั่งซื้อของคุณเสร็จสมบูรณ์แล้ว</p>
            <Button onClick={() => router.push('/')} className="bg-orange-500 hover:bg-orange-600">
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 via-white to-green-50 pt-16">
      {/* Floating Elements for Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {showAnimation && (
          <>
            <div className="absolute top-20 left-10 animate-bounce delay-100">
              <Sparkles className="h-6 w-6 text-green-400 opacity-60" />
            </div>
            <div className="absolute top-32 right-16 animate-bounce delay-300">
              <Gift className="h-8 w-8 text-orange-400 opacity-60" />
            </div>
            <div className="absolute top-60 left-20 animate-bounce delay-500">
              <Star className="h-5 w-5 text-yellow-400 opacity-60" />
            </div>
            <div className="absolute top-80 right-10 animate-bounce delay-700">
              <Package className="h-6 w-6 text-green-500 opacity-60" />
            </div>
          </>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Main Success Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-8 text-white text-center relative">
            {/* Success Icon with Animation */}
            <div className={`mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 transform transition-all duration-1000 ${showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <div className={`space-y-4 transform transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h1 className="text-4xl font-bold">
                🎉 การชำระเงินสำเร็จ!
              </h1>
              <p className="text-xl text-green-100">
                ยินดีด้วย! การสั่งซื้อของคุณเสร็จสมบูรณ์แล้ว
              </p>
              
              {/* Order Number */}
              {/* <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mt-4">
                <span className="text-sm font-medium">
                  เลขที่คำสั่งซื้อ: <span className="font-bold">{orderNumber}</span>
                </span>
              </div> */}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 opacity-20">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="absolute top-4 right-4 opacity-20">
              <Gift className="h-8 w-8" />
            </div>
            <div className="absolute bottom-4 left-8 opacity-20">
              <Star className="h-6 w-6" />
            </div>
            <div className="absolute bottom-4 right-8 opacity-20">
              <Package className="h-6 w-6" />
            </div>
          </div>

          <CardContent className="p-8">
            {/* Customer Info */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <img
                src={profile.pictureUrl || '/api/placeholder/48/48'}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-green-200"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  สวัสดี คุณ{profile.displayName}! 👋
                </div>
                <div className="text-sm text-gray-600">
                  ขอบคุณที่ใช้บริการ EREWHON SHOP
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  สรุปคำสั่งซื้อ
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">เลขที่คำสั่งซื้อ:</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยอดรวม:</span>
                    <span className="text-lg font-bold text-green-600">฿{amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สถานะ:</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ชำระเงินแล้ว
                    </Badge>
                  </div>
                </div>
              </div> */}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-600" />
                  ขั้นตอนถัดไป
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">ยืนยันการชำระเงิน</div>
                      <div className="text-gray-600">เรียบร้อยแล้ว</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">เตรียมสินค้า</div>
                      <div className="text-gray-600">ใน 1-2 วันทำการ</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">จัดส่งสินค้า</div>
                      <div className="text-gray-600">ใน 3-5 วันทำการ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleGoHome}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                >
                  <Home className="h-5 w-5 mr-2" />
                  กลับหน้าหลัก
                </Button>
                
                <Button
                  onClick={handleViewOrders}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 py-3 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  ดูคำสั่งซื้อทั้งหมด
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={handleShareSuccess}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  แชร์ความสำเร็จ
                </Button>
                
                <Button
                  onClick={handleContactSupport}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  ติดต่อเรา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Delivery Info */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-orange-600" />
                ข้อมูลการจัดส่ง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">เวลาจัดส่งโดยประมาณ</div>
                  <div className="text-sm text-gray-600">3-5 วันทำการ</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">การแจ้งเตือน</div>
                  <div className="text-sm text-gray-600">แจ้งผ่าน LINE เมื่อจัดส่ง</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Service */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                ฝ่ายบริการลูกค้า
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">โทรศัพท์</div>
                  <div className="text-sm text-gray-600">02-123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">LINE Official</div>
                  <div className="text-sm text-gray-600">@erewhonshop</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>
  )
}