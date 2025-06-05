'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'
import { 
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Clock,
  Package,
  User,
  Phone,
  Plus,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import axios from 'axios'
import Image from 'next/image'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string | null
    image?: string | null
    stock: number
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
  isDefault: boolean
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  icon: React.ReactNode
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fee: number
}

interface CartSummary {
  subtotal: number
  shipping: number
  paymentFee: number
  tax: number
  total: number
  itemCount: number
}

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function CheckoutPage() {
  const { dbUser, profile, isInitialized, isLoggedIn } = useLiff()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string>('TH_POST')
  const [selectedPayment, setSelectedPayment] = useState<string>('PROMPTPAY')
  const [orderNotes, setOrderNotes] = useState('')
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    district: '',
    subDistrict: '',
    province: '',
    postalCode: '',
    isDefault: false
  })

  // Cart summary
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    paymentFee: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  })

  // Notification
  const [notification, setNotification] = useState<Notification | null>(null)

  // Shipping methods
  const shippingMethods: ShippingMethod[] = useMemo(() => [
    {
      id: 'TH_POST',
      name: 'จัดส่งมาตรฐาน',
      description: 'ส่งถึงบ้านใน 3-5 วันทำการ',
      price: 50,
      estimatedDays: '3-5 วัน',
      icon: <Package className="h-5 w-5" />
    },
    {
      id: 'TH_EXPRESS',
      name: 'จัดส่งด่วน',
      description: 'ส่งถึงบ้านใน 1-2 วันทำการ',
      price: 120,
      estimatedDays: '1-2 วัน',
      icon: <Truck className="h-5 w-5" />
    }
  ], [])

  // Payment methods
  const paymentMethods: PaymentMethod[] = useMemo(() => [
    {
      id: 'PROMPTPAY',
      name: 'พร้อมเพย์',
      description: 'โอนเงินผ่าน QR Code',
      icon: <Smartphone className="h-5 w-5" />,
      fee: 0
    },
    // {
    //   id: 'LINE_PAY',
    //   name: 'LINE Pay',
    //   description: 'ชำระผ่าน LINE Pay',
    //   icon: <CreditCard className="h-5 w-5" />,
    //   fee: 0
    // },
    // {
    //   id: 'BANK_TRANSFER',
    //   name: 'โอนเงินธนาคาร',
    //   description: 'โอนเงินผ่านธนาคาร',
    //   icon: <Building2 className="h-5 w-5" />,
    //   fee: 0
    // },
    // {
    //   id: 'COD',
    //   name: 'เก็บเงินปลายทาง',
    //   description: 'ชำระเงินเมื่อได้รับสินค้า',
    //   icon: <Banknote className="h-5 w-5" />,
    //   fee: 20
    // }
  ], [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    try {
      const response = await axios.get('/api/cart', {
        params: { userId: dbUser?.id }
      })
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart items:', error)
    }
  }, [dbUser])

  // Fetch addresses
  const fetchAddresses = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const { data } = await axios.get(`/api/user/addresses?userId=${dbUser?.id}`)
      const userAddresses = data.addresses || []
      setAddresses(userAddresses)
      
      // Auto-select default address or first address
      const defaultAddress = userAddresses.find((addr: Address) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id)
      } else if (userAddresses.length > 0) {
        setSelectedAddress(userAddresses[0].id)
      }
      
      return userAddresses
    } catch (error) {
      console.error('Error fetching addresses:', error)
      return []
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [dbUser])

  // Initial data fetch
  useEffect(() => {
    if (dbUser?.id) {
      fetchCartItems()
      fetchAddresses()
    }
  }, [dbUser, fetchAddresses, fetchCartItems])

  // Calculate summary when dependencies change
  const calculateSummary = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    
    const selectedShippingMethod = shippingMethods.find(method => method.id === selectedShipping)
    const shipping = selectedShippingMethod?.price || 0
    
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPayment)
    const paymentFee = selectedPaymentMethod?.fee || 0
    
    const tax = subtotal * 0.07 // 7% VAT
    const total = subtotal + shipping + paymentFee + tax

    setCartSummary({
      subtotal,
      shipping,
      paymentFee,
      tax,
      total,
      itemCount
    })
  }, [cartItems, selectedShipping, selectedPayment, shippingMethods, paymentMethods])

  // Calculate summary when dependencies change
  useEffect(() => {
    calculateSummary()
  }, [calculateSummary])

  // Add new address
  const handleAddAddress = async () => {
    try {
      console.log('Adding address:', newAddress) // Debug log
      
      const response = await axios.post('/api/user/addresses', {
        ...newAddress,
        userId: dbUser?.id
      })
      
      console.log('Add address response:', response.data) // Debug log
      
      if (response.data.success || response.data.address) {
        // Refresh addresses list without showing loading spinner
        const updatedAddresses = await fetchAddresses(false)
        
        // Set the newly added address as selected
        const newAddressId = response.data.address?.id
        if (newAddressId) {
          setSelectedAddress(newAddressId)
        } else if (updatedAddresses.length > 0) {
          // If we can't get the new address ID, select the last one (most recent)
          setSelectedAddress(updatedAddresses[updatedAddresses.length - 1].id)
        }
        
        // Close dialog and reset form
        setShowAddressDialog(false)
        setNewAddress({
          name: '',
          phone: '',
          address: '',
          district: '',
          subDistrict: '',
          province: '',
          postalCode: '',
          isDefault: false
        })
        
        // Show success notification
        showNotification('success', 'เพิ่มที่อยู่เรียบร้อยแล้ว')
      } else {
        console.error('Failed to add address:', response.data)
        showNotification('error', 'ไม่สามารถเพิ่มที่อยู่ได้ กรุณาลองใหม่อีกครั้ง')
      }
    } catch (error) {
      console.error('Error adding address:', error)
      if (axios.isAxiosError(error)) {
        showNotification('error', error.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มที่อยู่')
      } else {
        showNotification('error', 'เกิดข้อผิดพลาดในการเพิ่มที่อยู่')
      }
    }
  }

  // Process order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showNotification('error', 'กรุณาเลือกที่อยู่จัดส่ง')
      return
    }

    // Validate cart items
    const invalidItems = cartItems.filter(item => !item.product?.id)
    if (invalidItems.length > 0) {
      console.error('Invalid cart items:', invalidItems)
      showNotification('error', 'พบสินค้าที่ไม่ถูกต้องในตะกร้า กรุณาลองใหม่อีกครั้ง')
      return
    }

    try {
      setProcessing(true)
      
      const orderData = {
        userId: dbUser?.id,
        addressId: selectedAddress,
        shippingMethod: selectedShipping,
        paymentMethod: selectedPayment,
        notes: orderNotes,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        summary: cartSummary
      }

      console.log('Order data:', orderData) // เพิ่ม log เพื่อตรวจสอบข้อมูล

      const response = await axios.post('/api/orders', orderData)
      
      if (response.data.success) {
        // Clear cart
        await axios.delete('/api/cart/clear', {
          data: { userId: dbUser?.id }
        })
        
        // Redirect to order success page
        router.push(`/payment/${response.data.order.id}`)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      if (axios.isAxiosError(error)) {
        showNotification('error', error.response?.data?.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง')
      } else {
        showNotification('error', 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setProcessing(false)
    }
  }

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    // Hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000)
  }

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสินค้าในตะกร้า</h1>
          <p className="text-gray-600 mb-8">กรุณาเพิ่มสินค้าในตะกร้าก่อนทำการชำระเงิน</p>
          <Button onClick={() => router.push('/cart')} className="bg-orange-500 hover:bg-orange-600">
            กลับไปยังตะกร้า
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-orange-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">ชำระเงิน</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-gray-400">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                <Check className="h-3 w-3" />
              </div>
              ตะกร้าสินค้า
            </div>
            <div className="w-8 h-0.5 bg-orange-300"></div>
            <div className="flex items-center text-orange-600 font-medium">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2">
                2
              </div>
              ชำระเงิน
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center mr-2">
                3
              </div>
              เสร็จสิ้น
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  ข้อมูลผู้สั่งซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Image
                    src={profile.pictureUrl || '/api/placeholder/48/48'}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium">{profile.displayName}</div>
                    <div className="text-sm text-gray-500">ผู้สั่งซื้อ</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    ที่อยู่จัดส่ง
                  </div>
                  <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มที่อยู่
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>เพิ่มที่อยู่ใหม่</DialogTitle>
                        <DialogDescription>
                          กรุณากรอกข้อมูลที่อยู่สำหรับจัดส่งสินค้า
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">ชื่อผู้รับ</Label>
                            <Input
                              id="name"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="ชื่อ-นามสกุล"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="08xxxxxxxx"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address">ที่อยู่</Label>
                          <Textarea
                            id="address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="บ้านเลขที่ หมู่ ซอย ถนน"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="district">ตำบล/แขวง</Label>
                            <Input
                              id="district"
                              value={newAddress.district}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                              placeholder="ตำบล/แขวง"
                            />
                          </div>
                          <div>
                            <Label htmlFor="subDistrict">อำเภอ/เขต</Label>
                            <Input
                              id="subDistrict"
                              value={newAddress.subDistrict}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, subDistrict: e.target.value }))}
                              placeholder="อำเภอ/เขต"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="province">จังหวัด</Label>
                            <Input
                              id="province"
                              value={newAddress.province}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, province: e.target.value }))}
                              placeholder="จังหวัด"
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                            <Input
                              id="postalCode"
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddAddress} className="bg-orange-500 hover:bg-orange-600">
                          บันทึกที่อยู่
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>ไม่มีที่อยู่จัดส่ง</p>
                    <p className="text-sm">กรุณาเพิ่มที่อยู่สำหรับจัดส่งสินค้า</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{address.name}</div>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                    ที่อยู่หลัก
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                  <Phone className="h-3 w-3" />
                                  {address.phone}
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-3 w-3 mt-0.5" />
                                  <div>
                                    {address.address}, {address.district}, {address.subDistrict}, {address.province} {address.postalCode}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  วิธีการจัดส่ง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <div key={method.id} className="flex items-start space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-orange-500">{method.icon}</div>
                                <div>
                                  <div className="font-medium">{method.name}</div>
                                  <div className="text-sm text-gray-600">{method.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {method.price === 0 ? 'ฟรี' : `฿${method.price}`}
                                </div>
                                <div className="text-sm text-gray-500">{method.estimatedDays}</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  วิธีการชำระเงิน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-start space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-orange-500">{method.icon}</div>
                                <div>
                                  <div className="font-medium">{method.name}</div>
                                  <div className="text-sm text-gray-600">{method.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                {method.fee > 0 && (
                                  <div className="text-sm text-gray-500">
                                    +฿{method.fee}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>หมายเหตุสำหรับคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="เพิ่มหมายเหตุสำหรับคำสั่งซื้อ (ไม่บังคับ)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-28">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {(item.product.image || item.product.imageUrl) ? (
                          <Image
                            src={item.product.image || item.product.imageUrl || ''}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.product.name}</div>
                        <div className="text-xs text-gray-500">จำนวน {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium">
                        ฿{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ยอดรวมสินค้า ({cartSummary.itemCount} ชิ้น)</span>
                    <span>฿{cartSummary.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>ค่าจัดส่ง</span>
                    <span>
                      {cartSummary.shipping === 0 ? 'ฟรี' : `฿${cartSummary.shipping.toLocaleString()}`}
                    </span>
                  </div>

                  {cartSummary.paymentFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>ค่าธรรมเนียม</span>
                      <span>฿{cartSummary.paymentFee.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>ภาษี (7%)</span>
                    <span>฿{cartSummary.tax.toFixed(0)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-orange-600">฿{cartSummary.total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-medium"
                        disabled={!selectedAddress || processing}
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            กำลังดำเนินการ...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-5 w-5 mr-2" />
                            ยืนยันการสั่งซื้อ
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-orange-500" />
                          ยืนยันการสั่งซื้อ
                        </AlertDialogTitle>
                        <div className="space-y-3">
                          <p>คุณต้องการสั่งซื้อสินค้าทั้งหมด {cartSummary.itemCount} รายการ</p>
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>ยอดรวม:</span>
                                <span className="font-medium">฿{cartSummary.total.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>การชำระเงิน:</span>
                                <span className="font-medium">
                                  {paymentMethods.find(p => p.id === selectedPayment)?.name}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>การจัดส่ง:</span>
                                <span className="font-medium">
                                  {shippingMethods.find(s => s.id === selectedShipping)?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            การสั่งซื้อนี้ไม่สามารถยกเลิกได้หลังจากยืนยันแล้ว
                          </p>
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handlePlaceOrder}
                          className="bg-orange-500 hover:bg-orange-600"
                          disabled={processing}
                        >
                          {processing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Security Info */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="h-3 w-3" />
                    <span>ข้อมูลของคุณได้รับการปกป้องด้วยระบบรักษาความปลอดภัย</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">เวลาการจัดส่งโดยประมาณ</div>
                      <div className="text-gray-600">
                        {shippingMethods.find(method => method.id === selectedShipping)?.estimatedDays || '3-5 วัน'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">การรับประกัน</div>
                      <div className="text-gray-600">สินค้าชำรุดคืนเงิน 100%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium text-gray-900">ต้องการความช่วยเหลือ?</div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => window.open('tel:02-123-4567')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      โทร 02-123-4567
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => router.push('/support')}
                    >
                      ศูนย์ช่วยเหลือ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}