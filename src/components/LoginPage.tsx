'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Liff } from '@line/liff'
import Image from 'next/image'

type Profile = NonNullable<Awaited<ReturnType<Liff['getProfile']>>>

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liff = (await import('@line/liff')).default
        await liff.init({ liffId: `${liffId}` })
  
        if (!liff.isLoggedIn()) {
          setIsLoading(false)
        } else {
          const userProfile = await liff.getProfile()
          setProfile(userProfile)
          // Redirect to profile page when logged in
          router.push('/profile')
        }
      } catch (error) {
        console.error('Failed to initialize LIFF', error)
        setIsLoading(false)
      }
    }
  
    initLiff()
  }, [router])

  const handleLogin = async () => {
    const liff = (await import('@line/liff')).default
    liff.login()
  }

  const handleServiceInfo = () => {
    alert('ข้อมูลวิธีการใช้งาน')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-orange-700">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // Landing Page (แสดงเฉพาะเมื่อยังไม่ได้ login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .float-animation {
          animation: floatUpDown 3s ease-in-out infinite;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
        
        .delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black text-orange-900 leading-tight fade-in-left">
                  EREWHON<br />
                  SHOP
                </h1>
                
                <p className="text-xl text-orange-800 leading-relaxed fade-in-left delay-200 opacity-0">
                  ช้อปออนไลน์ง่ายๆ ไม่ต้องรอนาน ให้บริการตลอด 24 ชั่วโมง
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 fade-in-left delay-400 opacity-0">
                <button 
                  onClick={handleLogin}
                  className="bg-orange-400 cursor-pointer text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-orange-500 transition duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Login LINE เพื่อเข้าใช้งาน
                </button>
                
                <button 
                  onClick={handleServiceInfo}
                  className="bg-amber-300 cursor-pointer text-orange-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-amber-400 transition duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  วิธีการใช้งาน
                </button>
              </div>

              <div className="flex items-start gap-3 text-orange-700 fade-in-left delay-600 opacity-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 pulse-animation">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                </svg>
                <p className="text-sm">
                  ข้อมูลของคุณจะถูกเก็บเป็นความลับตามนโยบายความเป็นส่วนตัว
                </p>
              </div>
            </div>

            <div className="flex justify-center fade-in-right delay-800 opacity-0">
              <div className="float-animation">
                <Image 
                  src="/CatProduct.png" 
                  alt="Erewhon Shop" 
                  width={500} 
                  height={500}
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}