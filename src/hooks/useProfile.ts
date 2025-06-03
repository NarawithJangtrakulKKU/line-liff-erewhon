import { useState, useEffect, useCallback } from 'react'
import { useLiff } from '@/app/contexts/LiffContext'
import axios from 'axios'

interface ProfileStats {
  cartCount: number
  orderCount: number
  activeOrderCount: number
  totalSpent: number
  loading: boolean
  error: string | null
}

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

export function useProfile() {
  const { dbUser, isInitialized, isLoggedIn } = useLiff()
  const [stats, setStats] = useState<ProfileStats>({
    cartCount: 0,
    orderCount: 0,
    activeOrderCount: 0,
    totalSpent: 0,
    loading: true,
    error: null
  })

  const fetchProfileStats = useCallback(async () => {
    if (!dbUser?.id) {
      setStats(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Fetch cart items
      const cartResponse = await axios.get('/api/cart', {
        params: { userId: dbUser.id }
      })
      const cartItems: CartItem[] = cartResponse.data.items || []

      // Fetch orders
      const ordersResponse = await axios.get('/api/orders', {
        params: { userId: dbUser.id }
      })
      const orders: Order[] = ordersResponse.data.orders || []

      // Calculate stats
      const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
      const orderCount = orders.length
      
      // คำสั่งซื้อที่ยังไม่เสร็จสิ้น (ไม่ใช่ DELIVERED, CANCELLED, REFUNDED)
      const activeOrderCount = orders.filter(order => 
        !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)
      ).length
      
      // ยอดซื้อสะสมเฉพาะคำสั่งซื้อที่เสร็จสิ้นแล้ว
      const totalSpent = orders
        .filter(order => ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(order.status))
        .reduce((sum, order) => sum + order.total, 0)

      setStats({
        cartCount,
        orderCount,
        activeOrderCount,
        totalSpent,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error fetching profile stats:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'ไม่สามารถโหลดข้อมูลได้'
      }))
    }
  }, [dbUser])

  const refreshStats = useCallback(() => {
    fetchProfileStats()
  }, [fetchProfileStats])

  useEffect(() => {
    if (isInitialized && isLoggedIn && dbUser?.id) {
      fetchProfileStats()
    }
  }, [isInitialized, isLoggedIn, dbUser, fetchProfileStats])

  return {
    stats,
    refreshStats,
    isLoading: stats.loading
  }
} 