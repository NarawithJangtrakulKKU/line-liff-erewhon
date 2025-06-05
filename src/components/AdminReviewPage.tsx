'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Package,
  Users,
  BarChart3,
  Filter,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

// Types
interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recentReviews: number
  verifiedReviews: number
}

interface ProductRating {
  productId: string
  productName: string
  image?: string
  averageRating: number
  totalReviews: number
  fiveStarCount: number
  oneStarCount: number
  recentRating: number
  trend: 'up' | 'down' | 'stable'
  category: string
}

interface RecentReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    displayName: string
    pictureUrl?: string
  }
  product: {
    id: string
    name: string
    image?: string
  }
  isVerified: boolean
  isHelpful: number
  hasMedia: boolean
}

interface ReviewSummary {
  period: string
  excellent: number // 5 stars
  good: number // 4 stars
  average: number // 3 stars
  poor: number // 2 stars
  terrible: number // 1 star
}

export default function AdminReviewPage() {
  const router = useRouter()
  
  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentReviews: 0,
    verifiedReviews: 0
  })
  
  const [topRatedProducts, setTopRatedProducts] = useState<ProductRating[]>([])
  const [lowRatedProducts, setLowRatedProducts] = useState<ProductRating[]>([])
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([])
  const [reviewTrends, setReviewTrends] = useState<ReviewSummary[]>([])
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('30d')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Fetch review data
  const fetchReviewData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch review analytics data
      const [
        statsRes,
        topProductsRes,
        lowProductsRes,
        recentReviewsRes,
        trendsRes
      ] = await Promise.all([
        axios.get('/api/admin/reviews/stats'),
        axios.get('/api/admin/reviews/top-products'),
        axios.get('/api/admin/reviews/low-products'),
        axios.get('/api/admin/reviews/recent'),
        axios.get('/api/admin/reviews/trends?period=' + timeFilter)
      ])

      setReviewStats(statsRes.data)
      setTopRatedProducts(topProductsRes.data.products || [])
      setLowRatedProducts(lowProductsRes.data.products || [])
      setRecentReviews(recentReviewsRes.data.reviews || [])
      setReviewTrends(trendsRes.data.trends || [])

    } catch (error) {
      console.error('Error fetching review data:', error)
      setError('Failed to load review data')
      
      // Mock data for development
      setReviewStats({
        totalReviews: 1245,
        averageRating: 4.2,
        ratingDistribution: { 5: 640, 4: 380, 3: 165, 2: 45, 1: 15 },
        recentReviews: 89,
        verifiedReviews: 1156
      })
      
      setTopRatedProducts([
        {
          productId: '1',
          productName: 'Premium Green Tea',
          averageRating: 4.8,
          totalReviews: 124,
          fiveStarCount: 108,
          oneStarCount: 2,
          recentRating: 4.9,
          trend: 'up',
          category: 'Beverages'
        },
        {
          productId: '2',
          productName: 'Organic Honey',
          averageRating: 4.7,
          totalReviews: 89,
          fiveStarCount: 76,
          oneStarCount: 1,
          recentRating: 4.6,
          trend: 'stable',
          category: 'Food'
        }
      ])
      
      setLowRatedProducts([
        {
          productId: '3',
          productName: 'Instant Coffee',
          averageRating: 2.1,
          totalReviews: 34,
          fiveStarCount: 2,
          oneStarCount: 18,
          recentRating: 1.8,
          trend: 'down',
          category: 'Beverages'
        }
      ])
      
      setRecentReviews([
        {
          id: '1',
          rating: 5,
          comment: 'สินค้าดีมาก คุณภาพเยี่ยม!',
          createdAt: new Date().toISOString(),
          user: { displayName: 'John Doe' },
          product: { id: '1', name: 'Premium Green Tea' },
          isVerified: true,
          isHelpful: 5,
          hasMedia: true
        }
      ])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeFilter])

  useEffect(() => {
    fetchReviewData()
  }, [fetchReviewData])

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  const getProductStatus = (rating: number) => {
    if (rating >= 4.5) return { label: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (rating >= 4.0) return { label: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (rating >= 3.0) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' }
    if (rating >= 2.0) return { label: 'Poor', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Critical', color: 'bg-red-100 text-red-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="md:pl-64">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading review dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:pl-64">
        {/* Header */}
        <div className="bg-white border-b p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Review Dashboard</h1>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">สรุปความคิดเห็นและการประเมินสินค้าโดยรวม</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviewData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} md:mr-2`} />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-20 md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mx-4 md:mx-6 mt-4 md:mt-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center">
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Total Reviews</span>
                  <span className="sm:hidden">Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{reviewStats.totalReviews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{reviewStats.recentReviews} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center">
                  <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-yellow-500" />
                  <span className="hidden sm:inline">Average Rating</span>
                  <span className="sm:hidden">Rating</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-lg md:text-2xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="hidden sm:flex">
                    {renderStars(Math.round(reviewStats.averageRating))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  From {reviewStats.totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                  <span className="hidden sm:inline">Verified</span>
                  <span className="sm:hidden">Verified</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{reviewStats.verifiedReviews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((reviewStats.verifiedReviews / reviewStats.totalReviews) * 100).toFixed(1)}% verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center">
                  <ThumbsUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                  <span className="hidden sm:inline">Positive</span>
                  <span className="sm:hidden">Positive</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">
                  {(reviewStats.ratingDistribution[4] + reviewStats.ratingDistribution[5]).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(((reviewStats.ratingDistribution[4] + reviewStats.ratingDistribution[5]) / reviewStats.totalReviews) * 100).toFixed(1)}% positive
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Rating Distribution</CardTitle>
              <CardDescription className="hidden md:block">แสดงการกระจายของคะแนนรีวิว</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] || 0
                  const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 md:gap-4">
                      <div className="flex items-center gap-1 md:gap-2 w-12 md:w-20">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                      </div>
                      
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 w-16 md:w-24 text-right">
                        <span className="text-xs md:text-sm text-gray-600">{count}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Top Rated Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700 text-lg md:text-xl">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  สินค้าที่ได้รับการประเมินดี
                </CardTitle>
                <CardDescription className="hidden md:block">สินค้าที่มีคะแนนรีวิวสูงสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {topRatedProducts.length > 0 ? (
                    topRatedProducts.map((product, index) => {
                      const status = getProductStatus(product.averageRating)
                      return (
                        <div key={product.productId} className="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs md:text-sm font-bold text-green-700">#{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{product.productName}</h4>
                              <div className="flex items-center gap-1 md:gap-2 mt-1">
                                {renderStars(Math.round(product.averageRating), 'w-3 h-3')}
                                <span className="text-xs md:text-sm font-semibold text-gray-700">
                                  {product.averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({product.totalReviews})
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1 hidden md:block">
                                {product.category} • {product.fiveStarCount} ⭐⭐⭐⭐⭐
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            <Badge className={`${status.color} text-xs`}>
                              <span className="hidden md:inline">{status.label}</span>
                              <span className="md:hidden">✓</span>
                            </Badge>
                            {getTrendIcon(product.trend)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <Package className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400" />
                      <p className="text-sm md:text-base">ไม่มีข้อมูลสินค้า</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Rated Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-700 text-lg md:text-xl">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  สินค้าที่ต้องปรับปรุง
                </CardTitle>
                <CardDescription className="hidden md:block">สินค้าที่มีคะแนนรีวิวต่ำ ต้องให้ความสำคัญ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {lowRatedProducts.length > 0 ? (
                    lowRatedProducts.map((product, index) => {
                      const status = getProductStatus(product.averageRating)
                      return (
                        <div key={product.productId} className="flex items-center justify-between p-2 md:p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{product.productName}</h4>
                              <div className="flex items-center gap-1 md:gap-2 mt-1">
                                {renderStars(Math.round(product.averageRating), 'w-3 h-3')}
                                <span className="text-xs md:text-sm font-semibold text-gray-700">
                                  {product.averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({product.totalReviews})
                                </span>
                              </div>
                              <div className="text-xs text-red-600 mt-1 hidden md:block">
                                {product.category} • {product.oneStarCount} ⭐ negative
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            <Badge className={`${status.color} text-xs`}>
                              <span className="hidden md:inline">{status.label}</span>
                              <span className="md:hidden">!</span>
                            </Badge>
                            {getTrendIcon(product.trend)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <CheckCircle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-green-500" />
                      <p className="text-sm md:text-base">ไม่มีสินค้าที่มีคะแนนต่ำ</p>
                      <p className="text-xs md:text-sm">สินค้าทั้งหมดได้รับการประเมินที่ดี!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl">Recent Reviews</CardTitle>
                  <CardDescription className="hidden md:block">รีวิวล่าสุดที่เข้ามาในระบบ</CardDescription>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/reviews')}
                >
                  <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {review.user.pictureUrl ? (
                        <Image
                          src={review.user.pictureUrl}
                          alt={review.user.displayName}
                          width={32}
                          height={32}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <span className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {review.user.displayName}
                          </span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                              <span className="hidden md:inline">Verified</span>
                              <span className="md:hidden">✓</span>
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating, 'w-3 h-3 md:w-4 md:h-4')}
                        <span className="text-xs md:text-sm font-medium">
                          {review.rating}/5
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {review.comment}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 min-w-0">
                          <span className="hidden md:inline">Product: </span>
                          <span className="font-medium truncate">{review.product.name}</span>
                          {review.hasMedia && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              <span className="hidden md:inline">Has Media</span>
                              <span className="md:hidden">📷</span>
                            </Badge>
                          )}
                        </div>
                        
                        {review.isHelpful > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <ThumbsUp className="w-3 h-3" />
                            {review.isHelpful}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
