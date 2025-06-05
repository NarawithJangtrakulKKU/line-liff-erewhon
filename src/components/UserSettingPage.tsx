'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLiff } from '@/app/contexts/LiffContext'
import axios from 'axios'
import { 
  User,
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Check,
  X
} from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface AddressFormData {
  name: string
  phone: string
  address: string
  district: string
  subDistrict: string
  province: string
  postalCode: string
  isDefault: boolean
}

interface UserFormData {
  email: string
  phone: string
}

const AddressForm = React.memo(({ 
  formData,
  setFormData,
  onSubmit, 
  onCancel,
  submitLabel,
  submitting
}: { 
  formData: AddressFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  submitting: boolean;
}) => {
  const handleInputChange = useCallback((field: keyof AddressFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, [setFormData]);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  }, [setFormData]);

  const isFormValid = formData.name.trim() && 
                     formData.phone.trim() && 
                     formData.address.trim() && 
                     formData.district.trim() && 
                     formData.subDistrict.trim() && 
                     formData.province.trim() && 
                     formData.postalCode.trim();

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">ชื่อผู้รับ *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="กรอกชื่อผู้รับ"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          placeholder="กรอกเบอร์โทรศัพท์"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="address">ที่อยู่ *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={handleInputChange('address')}
          placeholder="บ้านเลขที่ ซอย ถนน"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="district">ตำบล/แขวง *</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={handleInputChange('district')}
            placeholder="ตำบล/แขวง"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="subDistrict">อำเภอ/เขต *</Label>
          <Input
            id="subDistrict"
            value={formData.subDistrict}
            onChange={handleInputChange('subDistrict')}
            placeholder="อำเภอ/เขต"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="province">จังหวัด *</Label>
          <Input
            id="province"
            value={formData.province}
            onChange={handleInputChange('province')}
            placeholder="จังหวัด"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="postalCode">รหัสไปรษณีย์ *</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange('postalCode')}
            placeholder="รหัสไปรษณีย์"
            maxLength={5}
            required
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="isDefault">ตั้งเป็นที่อยู่หลัก</Label>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={submitting || !isFormValid}
        >
          {submitting ? 'กำลังบันทึก...' : submitLabel}
        </Button>
      </div>
    </div>
  )
});

AddressForm.displayName = 'AddressForm';

export default function UserSettingPage() {
  const { profile, dbUser, isInitialized, isLoggedIn, refreshUserData } = useLiff()
  const router = useRouter()
  
  // States
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  
  // User form states
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    phone: ''
  })
  const [hasUserChanges, setHasUserChanges] = useState(false)
  
  // Address modal states
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false)
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    name: '',
    phone: '',
    address: '',
    district: '',
    subDistrict: '',
    province: '',
    postalCode: '',
    isDefault: false
  })
  
  // Notification states
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' })

  // Show notification function
  const showNotification = useCallback((type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message })
  }, [])

  // Check if user is logged in
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

  // Initialize user form data
  useEffect(() => {
    if (dbUser) {
      setUserFormData({
        email: dbUser.email || '',
        phone: dbUser.phone || ''
      })
    }
  }, [dbUser])

  // Track user form changes
  useEffect(() => {
    if (dbUser) {
      const hasChanges = userFormData.email !== (dbUser.email || '') || 
                        userFormData.phone !== (dbUser.phone || '')
      setHasUserChanges(hasChanges)
    }
  }, [userFormData, dbUser])

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!dbUser) return
    
    try {
      setLoadingAddresses(true)
      const { data } = await axios.get(`/api/user/addresses?userId=${dbUser.id}`)
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
      showNotification('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลที่อยู่ได้')
    } finally {
      setLoadingAddresses(false)
    }
  }, [dbUser, showNotification])

  useEffect(() => {
    if (dbUser) {
      fetchAddresses()
    }
  }, [dbUser, fetchAddresses])

  // Reset address form
  const resetAddressForm = useCallback(() => {
    setAddressFormData({
      name: '',
      phone: '',
      address: '',
      district: '',
      subDistrict: '',
      province: '',
      postalCode: '',
      isDefault: false
    })
    setSelectedAddress(null)
  }, [])

  // Handle user form input changes
  const handleUserInputChange = useCallback((field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserFormData(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  // Save user information
  const handleSaveUserInfo = useCallback(async () => {
    if (!dbUser) return

    try {
      setSaving(true)
      await axios.put(`/api/user/${dbUser.id}`, userFormData)
      await refreshUserData()
      setHasUserChanges(false)
      showNotification('success', 'บันทึกสำเร็จ', 'ข้อมูลส่วนตัวได้รับการอัปเดตแล้ว')
    } catch (error) {
      console.error('Error updating user info:', error)
      showNotification('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setSaving(false)
    }
  }, [dbUser, userFormData, refreshUserData, showNotification])

  // Handle add address
  const handleAddAddress = useCallback(async () => {
    if (!dbUser) return

    try {
      setSaving(true)
      await axios.post('/api/user/addresses', {
        ...addressFormData,
        userId: dbUser.id
      })
      await fetchAddresses()
      setIsAddAddressModalOpen(false)
      resetAddressForm()
      showNotification('success', 'เพิ่มที่อยู่สำเร็จ', 'ที่อยู่ใหม่ได้รับการเพิ่มแล้ว')
    } catch (error) {
      console.error('Error adding address:', error)
      showNotification('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มที่อยู่ได้')
    } finally {
      setSaving(false)
    }
  }, [dbUser, addressFormData, fetchAddresses, resetAddressForm, showNotification])

  // Handle edit address
  const handleEditAddress = useCallback((address: Address) => {
    setSelectedAddress(address)
    setAddressFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      district: address.district,
      subDistrict: address.subDistrict,
      province: address.province,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    })
    setIsEditAddressModalOpen(true)
  }, [])

  // Handle update address
  const handleUpdateAddress = useCallback(async () => {
    if (!selectedAddress) return

    try {
      setSaving(true)
      await axios.put(`/api/user/addresses/${selectedAddress.id}`, addressFormData)
      await fetchAddresses()
      setIsEditAddressModalOpen(false)
      resetAddressForm()
      showNotification('success', 'อัปเดตที่อยู่สำเร็จ', 'ที่อยู่ได้รับการอัปเดตแล้ว')
    } catch (error) {
      console.error('Error updating address:', error)
      showNotification('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตที่อยู่ได้')
    } finally {
      setSaving(false)
    }
  }, [selectedAddress, addressFormData, fetchAddresses, resetAddressForm, showNotification])

  // Handle delete address
  const handleDeleteAddress = useCallback(async (addressId: string) => {
    try {
      await axios.delete(`/api/user/addresses/${addressId}`)
      await fetchAddresses()
      showNotification('success', 'ลบที่อยู่สำเร็จ', 'ที่อยู่ได้รับการลบแล้ว')
    } catch (error) {
      console.error('Error deleting address:', error)
      showNotification('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบที่อยู่ได้')
    }
  }, [fetchAddresses, showNotification])

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

  if (!profile || !dbUser) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-orange-700">ไม่พบข้อมูลผู้ใช้</p>
          <Button 
            onClick={() => router.push('/profile')}
            className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
          >
            กลับไปหน้าโปรไฟล์
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              ข้อมูลส่วนตัว
            </CardTitle>
            <CardDescription>
              แก้ไขข้อมูลส่วนตัวของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Display (Read Only) */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Image
                src={profile.pictureUrl || '/api/placeholder/64/64'}
                alt="Profile"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-medium">{profile.displayName}</h3>
                <p className="text-sm text-gray-500">LINE Display Name</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  อีเมล
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange('email')}
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="userPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={userFormData.phone}
                  onChange={handleUserInputChange('phone')}
                  placeholder="กรอกเบอร์โทรศัพท์ของคุณ"
                />
              </div>
            </div>

            {/* Save Button */}
            {hasUserChanges && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveUserInfo}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Addresses Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  ที่อยู่ในการจัดส่ง
                </CardTitle>
                <CardDescription>
                  จัดการที่อยู่สำหรับการจัดส่งสินค้า
                </CardDescription>
              </div>
              <Dialog open={isAddAddressModalOpen} onOpenChange={setIsAddAddressModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetAddressForm} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มที่อยู่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>เพิ่มที่อยู่ใหม่</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลที่อยู่สำหรับการจัดส่งสินค้า
                    </DialogDescription>
                  </DialogHeader>
                  <AddressForm 
                    formData={addressFormData}
                    setFormData={setAddressFormData}
                    onSubmit={handleAddAddress}
                    onCancel={() => setIsAddAddressModalOpen(false)}
                    submitLabel="เพิ่มที่อยู่"
                    submitting={saving}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAddresses ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังโหลดที่อยู่...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีที่อยู่</h3>
                <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มที่อยู่แรกของคุณ</p>
                <Dialog open={isAddAddressModalOpen} onOpenChange={setIsAddAddressModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetAddressForm} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มที่อยู่แรก
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{address.name}</h4>
                          {address.isDefault && (
                            <Badge variant="default" className="bg-orange-500">
                              <Check className="h-3 w-3 mr-1" />
                              ที่อยู่หลัก
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                        <p className="text-sm text-gray-700">
                          {address.address}, {address.district}, {address.subDistrict}, {address.province} {address.postalCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
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
                              <AlertDialogTitle>ลบที่อยู่</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ที่จะลบที่อยู่ &quot;{address.name}&quot;? การดำเนินการนี้ไม่สามารถยกเลิกได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAddress(address.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                ลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Address Modal */}
        <Dialog open={isEditAddressModalOpen} onOpenChange={setIsEditAddressModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไขที่อยู่</DialogTitle>
              <DialogDescription>
                อัปเดตข้อมูลที่อยู่ของคุณ
              </DialogDescription>
            </DialogHeader>
            <AddressForm 
              formData={addressFormData}
              setFormData={setAddressFormData}
              onSubmit={handleUpdateAddress}
              onCancel={() => setIsEditAddressModalOpen(false)}
              submitLabel="อัปเดตที่อยู่"
              submitting={saving}
            />
          </DialogContent>
        </Dialog>

        {/* Notification Modal */}
        <Dialog open={notification.show} onOpenChange={(open) => setNotification(prev => ({ ...prev, show: open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${
                notification.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                {notification.title}
              </DialogTitle>
              <DialogDescription>
                {notification.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className={
                  notification.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                ตกลง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}