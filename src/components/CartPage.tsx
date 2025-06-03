'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  Truck,
  CreditCard,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import axios from 'axios'

interface CartItem {
  id: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    description: string | null
    price: number
    comparePrice: number | null
    image?: string | null // เพิ่ม property นี้เผื่อ API ส่งมาเป็น image
    imageUrl?: string | null // เก็บไว้เผื่อ API ส่งมาเป็น imageUrl
    stock: number
    isActive: boolean
    category: {
      name: string
    }
  }
}

interface CartSummary {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  itemCount: number
}

export default function CartPage() {
  const { dbUser, profile, isInitialized, isLoggedIn } = useLiff()
  const router = useRouter()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    if (!dbUser?.id) {
      console.log('[CartPage] dbUser is missing:', dbUser)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get('/api/cart', {
        params: { userId: dbUser.id }
      })
      console.log('[CartPage] cart API response:', response.data)
      setCartItems(response.data.items || [])
      calculateSummary(response.data.items || [])
      console.log('[CartPage] setCartItems:', response.data.items)
    } catch (error) {
      console.error('[CartPage] Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }, [dbUser])

  useEffect(() => {
    console.log('[CartPage] dbUser:', dbUser)
    if (dbUser?.id) {
      fetchCartItems()
    }
  }, [dbUser, fetchCartItems])

  // Calculate cart summary
  const calculateSummary = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const shipping = subtotal > 1000 ? 0 : 50 // Free shipping over 1000 THB
    const tax = subtotal * 0.07 // 7% VAT
    const total = subtotal + shipping + tax

    setCartSummary({
      subtotal,
      shipping,
      tax,
      discount: 0,
      total,
      itemCount
    })
  }

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdating(itemId)
      
      const response = await axios.put('/api/cart', {
        itemId,
        quantity: newQuantity
      })

      if (response.data.success) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
        
        const updatedItems = cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        calculateSummary(updatedItems)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }, [cartItems])

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setUpdating(itemId)
      
      const response = await axios.delete('/api/cart', {
        data: { itemId }
      })

      if (response.data.success) {
        const updatedItems = cartItems.filter(item => item.id !== itemId)
        setCartItems(updatedItems)
        calculateSummary(updatedItems)
      }
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }, [cartItems])

  // Handle checkout
  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-9 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border rounded-lg p-6">
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                
                {/* Cart Item Skeletons */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex gap-4">
                      {/* Image Skeleton */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                      
                      {/* Content Skeleton */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                          <div className="text-right">
                            <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Promo Code Skeleton */}
              <div className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Summary Skeleton */}
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <div className="h-6 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 mt-4 border-t">
                  <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="text-center">
                    <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Delivery Info Skeleton */}
              <div className="border rounded-lg p-6">
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded-sm animate-pulse mt-0.5"></div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    console.log('[CartPage] No profile, returning null')
    return null
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="cursor-pointer hover:bg-orange-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-orange-500" />
              ตะกร้าสินค้า
            </h1>
            {cartSummary.itemCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {cartSummary.itemCount} รายการ
              </Badge>
            )}
          </div>
        </div>
        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ยังไม่มีสินค้าในตะกร้าของคุณ เริ่มช้อปปิ้งเพื่อเพิ่มสินค้าที่คุณชื่นชอบ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/home')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                เริ่มช้อปปิ้ง
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/allcategories')}
                className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-3"
              >
                ดูหมวดหมู่สินค้า
              </Button>
            </div>
          </div>
        ) : (
          // Cart with items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>สินค้าในตะกร้า ({cartItems.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/home')}
                      className="cursor-pointer text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      เพิ่มสินค้า
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {(item.product?.image || item.product?.imageUrl) ? (
                            <Image
                              src={item.product.image || item.product.imageUrl || ''}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">
                                {item.product?.name || <span className="text-red-500">[สินค้านี้ถูกลบ]</span>}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {item.product?.isActive === false ? 'ไม่พร้อมจำหน่าย' : item.product?.name ? 'พร้อมจำหน่าย' : ''}
                              </p>
                            </div>
                            
                            {/* Wishlist & Remove */}
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="cursor-pointer text-gray-400 hover:text-red-500">
                                <Heart className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="cursor-pointer text-gray-400 hover:text-red-500"
                                    disabled={updating === item.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ลบสินค้าออกจากตะกร้า</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณต้องการลบ &quot;{item.product?.name || 'สินค้านี้ถูกลบ'}&quot; ออกจากตะกร้าหรือไม่?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeItem(item.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      ลบออก
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updating === item.id || !item.product}
                                  className="cursor-pointer h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {updating === item.id ? '...' : item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.product ? (item.quantity >= item.product.stock || updating === item.id) : true}
                                  className="cursor-pointer h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <span className="text-xs text-gray-500">
                                {item.product ? `คงเหลือ ${item.product.stock} ชิ้น` : ''}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900">
                                {item.product ? `฿${(item.product.price * item.quantity).toLocaleString()}` : '-'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.product ? `฿${item.product.price.toLocaleString()} / ชิ้น` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle>สรุปการสั่งซื้อ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>ยอดรวมสินค้า ({cartSummary.itemCount} ชิ้น)</span>
                      <span>฿{cartSummary.subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span>ค่าจัดส่ง</span>
                      </div>
                      <div className="text-right">
                        {cartSummary.shipping === 0 ? (
                          <div>
                            <span className="text-green-600 font-medium">ฟรี</span>
                            <div className="text-xs text-gray-500">ซื้อครบ ฿1,000</div>
                          </div>
                        ) : (
                          <span>฿{cartSummary.shipping.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span>ภาษี (7%)</span>
                      <span>฿{cartSummary.tax.toLocaleString()}</span>
                    </div>

                    {cartSummary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>ส่วนลด</span>
                        <span>-฿{cartSummary.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>ยอดรวมทั้งหมด</span>
                      <span className="text-orange-600">฿{cartSummary.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleCheckout}
                      className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-medium"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      ดำเนินการชำระเงิน
                    </Button>
                    
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Truck className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <div className="font-medium">จัดส่งฟรี</div>
                        <div className="text-gray-600">สำหรับคำสั่งซื้อตั้งแต่ ฿1,000</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <div className="font-medium">จัดส่งทั่วประเทศ</div>
                        <div className="text-gray-600">ส่งถึงบ้านใน 1-3 วันทำการ</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}