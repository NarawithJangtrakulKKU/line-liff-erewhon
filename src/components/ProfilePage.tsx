'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLiff } from '@/app/contexts/LiffContext'
import { useProfile } from '@/hooks/useProfile'
import Navbar from '@/components/Navbar'
import { 
  User, 
  Calendar, 
  ShoppingBag, 
  Settings, 
  Star,
  Package,
  TrendingUp,
  History,
  Wallet,
  RefreshCw
} from 'lucide-react'

export default function ProfilePage() {
  const { profile, dbUser, isInitialized, isLoggedIn, logout } = useLiff()
  const { stats, refreshStats } = useProfile()
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
      href: "/myorders",
      color: "from-blue-400 to-blue-500",
      badge: stats.activeOrderCount > 0 ? stats.activeOrderCount : null
    },
    {
      title: "ประวัติการสั่งซื้อ",
      description: "ดูประวัติการซื้อสินค้า",
      icon: History,
      href: "/purchase-history",
      color: "from-green-400 to-green-500"
    },
    {
      title: "ตะกร้าสินค้า",
      description: "จัดการสินค้าในตะกร้า",
      icon: Package,
      href: "/cart",
      color: "from-purple-400 to-purple-500",
      badge: stats.cartCount > 0 ? stats.cartCount : null
    },
    {
      title: "ตั้งค่าบัญชี",
      description: "จัดการข้อมูลส่วนตัว",
      icon: Settings,
      href: "/settings",
      color: "from-gray-400 to-gray-500"
    }
  ]

  const displayStats = [
    { 
      label: "สินค้าในตะกร้า", 
      value: stats.loading ? "..." : stats.cartCount.toString(), 
      icon: ShoppingBag,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      label: "คำสั่งซื้อทั้งหมด", 
      value: stats.loading ? "..." : stats.orderCount.toString(), 
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "ยอดซื้อสะสม", 
      value: stats.loading ? "..." : `฿${stats.totalSpent.toLocaleString()}`, 
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          
          {/* Hero Section - ปรับให้ responsive ดีขึ้น */}
          <div className="bg-gradient-to-r from-gray-900 to-orange-800 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden mb-6 md:mb-8">
            <div className="p-6 md:p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <Image
                    src={profile.pictureUrl || '/api/placeholder/128/128'}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-400 text-white rounded-full p-2">
                    <User className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {profile.displayName}
                  </h1>
                  <p className="text-orange-100 text-base md:text-lg mb-3 md:mb-4">
                    ยินดีต้อนรับสู่ EREWHON SHOP
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      สมาชิกตั้งแต่: {new Date(dbUser.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={refreshStats}
                    className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                    disabled={stats.loading}
                  >
                    <RefreshCw className={`w-5 h-5 ${stats.loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - ปรับให้ responsive ดีขึ้น */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                  </div>
                  <div className={`${stat.color} ${stat.bgColor} p-3 rounded-xl`}>
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* User Information - ปรับให้ compact ขึ้น */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  ข้อมูลส่วนตัว
                </h3>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 md:p-4 rounded-lg md:rounded-xl border border-orange-200">
                    <p className="text-orange-600 text-sm font-medium mb-1">ชื่อที่แสดง</p>
                    <p className="text-gray-800 font-medium">{profile.displayName}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg md:rounded-xl border border-blue-200">
                    <p className="text-blue-600 text-sm font-medium mb-1">LINE ID</p>
                    <p className="font-mono text-gray-800 text-xs break-all">{profile.userId}</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 md:p-4 rounded-lg md:rounded-xl border border-green-200">
                    <p className="text-green-600 text-sm font-medium mb-1">อัปเดตล่าสุด</p>
                    <p className="text-gray-800 text-sm">
                      {new Date(dbUser.updatedAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  
                  {profile.statusMessage && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 md:p-4 rounded-lg md:rounded-xl border border-yellow-200">
                      <p className="text-yellow-600 text-sm font-medium mb-1">สเตตัส</p>
                      <p className="text-gray-800">{profile.statusMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions - ปรับให้ responsive ดีขึ้น */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  เมนูหลัก
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index}
                      onClick={() => router.push(action.href)}
                      className="group relative bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-orange-300 p-4 md:p-6 rounded-lg md:rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`bg-gradient-to-r ${action.color} text-white p-2.5 md:p-3 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                              {action.title}
                            </h4>
                            {action.badge && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                {action.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {stats.error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600">{stats.error}</p>
              <button 
                onClick={refreshStats}
                className="mt-2 text-red-700 hover:text-red-800 underline"
              >
                ลองใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}