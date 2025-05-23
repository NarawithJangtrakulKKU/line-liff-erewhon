'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/app/contexts/LiffContext'
import Navbar from '@/components/Navbar'
import { 
  User, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  Star,
  Package,
  TrendingUp,
  Award
} from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-orange-700 text-lg font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!profile || !dbUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="text-orange-400 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-orange-700 text-lg font-medium mb-6">ไม่พบข้อมูลโปรไฟล์</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-400 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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

  const quickActions = [
    {
      title: "คำสั่งซื้อของฉัน",
      description: "ติดตามสถานะการสั่งซื้อ",
      icon: ShoppingBag,
      href: "/orders",
      color: "from-blue-400 to-blue-500"
    },
    {
      title: "ประวัติการสั่งซื้อ",
      description: "ดูประวัติการซื้อสินค้า",
      icon: Package,
      href: "/order-history",
      color: "from-green-400 to-green-500"
    },
    {
      title: "การชำระเงิน",
      description: "จัดการวิธีการชำระเงิน",
      icon: CreditCard,
      href: "/payment-methods",
      color: "from-purple-400 to-purple-500"
    },
    {
      title: "ตั้งค่าบัญชี",
      description: "จัดการข้อมูลส่วนตัว",
      icon: Settings,
      href: "/settings",
      color: "from-gray-400 to-gray-500"
    }
  ]

  const stats = [
    { 
      label: "สินค้าในตะกร้า", 
      value: "0", 
      icon: ShoppingBag,
      color: "text-orange-600"
    },
    { 
      label: "คำสั่งซื้อ", 
      value: "0", 
      icon: TrendingUp,
      color: "text-blue-600"
    },
    { 
      label: "แต้มสะสม", 
      value: "0", 
      icon: Award,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-orange-50">
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-black to-orange-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <img
                    src={profile.pictureUrl || '/api/placeholder/128/128'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-400 text-white rounded-full p-2">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profile.displayName}
                  </h1>
                  <p className="text-orange-100 text-lg mb-4">
                    ยินดีต้อนรับสู่ EREWHON SHOP
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      สมาชิกตั้งแต่: {new Date(dbUser.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                  </div>
                  <div className={`${stat.color} bg-gray-50 p-3 rounded-full`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* User Information */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  ข้อมูลส่วนตัว
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <p className="text-orange-600 text-sm font-medium mb-1">LINE ID</p>
                    <p className="font-mono text-gray-800 text-xs break-all">{profile.userId}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <p className="text-blue-600 text-sm font-medium mb-1">ชื่อที่แสดง</p>
                    <p className="text-gray-800">{profile.displayName}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <p className="text-purple-600 text-sm font-medium mb-1">Database ID</p>
                    <p className="font-mono text-gray-800 text-xs break-all">{dbUser.id}</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <p className="text-green-600 text-sm font-medium mb-1">อัปเดตล่าสุด</p>
                    <p className="text-gray-800 text-sm">
                      {new Date(dbUser.updatedAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  
                  {profile.statusMessage && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                      <p className="text-yellow-600 text-sm font-medium mb-1">สเตตัส</p>
                      <p className="text-gray-800">{profile.statusMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  เมนูหลัก
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index}
                      onClick={() => router.push(action.href)}
                      className="group bg-white/50 backdrop-blur-sm hover:bg-white/80 border border-gray-200 hover:border-orange-300 p-6 rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`bg-gradient-to-r ${action.color} text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Additional Features */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4">ฟีเจอร์เพิ่มเติม</h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                      🎁 สะสมแต้มรีวอร์ด
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      🚚 จัดส่งฟรี
                    </span>
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      ⭐ สมาชิกพิเศษ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}