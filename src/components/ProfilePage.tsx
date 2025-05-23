'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'

export default function ProfilePage() {
  const { profile, dbUser, isInitialized, isLoggedIn, logout } = useLiff()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/')
    }
  }, [isInitialized, isLoggedIn, router])

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
          <p className="text-orange-700">ไม่พบข้อมูลโปรไฟล์</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50">
      {/* Header */}
      <div className="bg-orange-400 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg viewBox="0 0 36 36" className="h-8 w-8 mr-2">
              <path fill="#FFFFFF" d="M32,8.2c0-4.1-4.1-7.5-9.2-7.5H13.2C8.1,0.7,4,4.1,4,8.2v15.5c0,0.5,0,1.4,0.2,1.9l0,0c0.3,1.2,0.9,2.3,1.7,3.1
              l0.2,0.2L6,29.2c0,0.6,0.4,1.3,1.1,1.5c0.4,0.1,0.8,0.1,1.1-0.1l3.9-2.2c0.7,0.2,1.4,0.3,2.1,0.3h9.5c5.1,0,9.2-3.4,9.2-7.5V8.2z"/>
            </svg>
            <h1 className="text-xl font-bold">EREWHON SHOP</h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src={profile.pictureUrl || '/api/placeholder/128/128'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <h2 className="mt-4 text-3xl font-bold text-white">{profile.displayName}</h2>
              <p className="mt-2 text-orange-100">ยินดีต้อนรับสู่ EREWHON SHOP</p>
              
              {/* แสดงสถานะการบันทึกข้อมูล */}
              <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm">
                  📅 สมาชิกตั้งแต่: {new Date(dbUser.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-900 border-b-2 border-orange-200 pb-2">
                  ข้อมูลผู้ใช้
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-orange-600 text-sm font-medium">LINE ID</p>
                    <p className="font-mono text-gray-800 break-all text-xs">{profile.userId}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-orange-600 text-sm font-medium">ชื่อที่แสดง</p>
                    <p className="text-gray-800">{profile.displayName}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-orange-600 text-sm font-medium">Database ID</p>
                    <p className="font-mono text-gray-800 break-all text-xs">{dbUser.id}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-orange-600 text-sm font-medium">อัปเดตล่าสุด</p>
                    <p className="text-gray-800 text-sm">
                      {new Date(dbUser.updatedAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  
                  {profile.statusMessage && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-orange-600 text-sm font-medium">สเตตัส</p>
                      <p className="text-gray-800">{profile.statusMessage}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-900 border-b-2 border-orange-200 pb-2">
                  เมนูหลัก
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-lg text-left transition duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div>
                      <p className="font-medium">สินค้าของฉัน</p>
                      <p className="text-sm text-orange-600">จัดการสินค้าที่สั่งซื้อ</p>
                    </div>
                  </button>
                  
                  <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-lg text-left transition duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">ประวัติการสั่งซื้อ</p>
                      <p className="text-sm text-orange-600">ดูประวัติการซื้อสินค้า</p>
                    </div>
                  </button>
                  
                  <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-lg text-left transition duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">ตั้งค่าบัญชี</p>
                      <p className="text-sm text-orange-600">จัดการข้อมูลส่วนตัว</p>
                    </div>
                  </button>

                  
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="border-t border-orange-200 pt-6 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-orange-700">สินค้าในตะกร้า</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-orange-700">คำสั่งซื้อ</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-orange-700">แต้มสะสม</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}