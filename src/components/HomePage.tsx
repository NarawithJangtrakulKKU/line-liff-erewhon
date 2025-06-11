'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag, Star } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    sortOrder: number
}

interface Product {
    id: string
    name: string
    description: string | null
    price: string | number
    comparePrice?: string | number | null
    images?: Array<{ imageUrl: string }>
    averageRating: number
    reviewCount: number
}

interface HotBarItem {
    id: string
    name: string
    description: string | null
    price: number
    comparePrice?: number | null
    image: string
    badge?: string
    averageRating: number
    reviewCount: number
}

interface FeaturedSection {
    id: number
    title: string
    subtitle: string
    image: string
    color: string
    textColor: string
}

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [hotBarSlide, setHotBarSlide] = useState(0)
    const [newestProductsSlide, setNewestProductsSlide] = useState(0)
    const [allProductsSlide, setAllProductsSlide] = useState(0)
    const [hotBarItems, setHotBarItems] = useState<HotBarItem[]>([])
    const [newestProducts, setNewestProducts] = useState<HotBarItem[]>([])
    const [allProducts, setAllProducts] = useState<HotBarItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isNewestLoading, setIsNewestLoading] = useState(true)
    const [isAllProductsLoading, setIsAllProductsLoading] = useState(true)
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

    // Calculate number of items per view based on screen size
    const [itemsPerView, setItemsPerView] = useState(3)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1)
            } else if (window.innerWidth < 1024) {
                setItemsPerView(2)
            } else {
                setItemsPerView(3)
            }
        }

        // Set initial value
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories')
                if (response.data.success && response.data.categories) {
                    setCategories(response.data.categories)
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setIsCategoriesLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // Featured Sections Data
    const featuredSections: FeaturedSection[] = [
        {
            id: 1,
            title: 'SINCERELY SMOOTHIE',
            subtitle: 'BY KALI UCHIS',
            image: '/images/carousel/pexels-ash-craig-122861-376464.jpg',
            color: 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100',
            textColor: 'text-gray-800'
        },
        {
            id: 2,
            title: 'DAILY SPECIALS',
            subtitle: 'MONDAY',
            image: '/images/carousel/pexels-ella-olsson-572949-1640777.jpg',
            color: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100',
            textColor: 'text-gray-800'
        },
        {
            id: 3,
            title: 'EAT IN SEASON',
            subtitle: '',
            image: '/images/carousel/pexels-janetrangdoan-1099680.jpg',
            color: 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100',
            textColor: 'text-gray-800'
        },
        {
            id: 4,
            title: 'DAILY SPECIALS',
            subtitle: 'EXPLORE ESSENTIALS',
            image: '/images/carousel/pexels-robinstickel-70497.jpg',
            color: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
            textColor: 'text-gray-800'
        }
    ]

    // Fetch featured products
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await axios.get('/api/products/featured')
                if (response.data.success && response.data.products) {
                    const formattedProducts = response.data.products.map((product: Product) => ({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
                        image: product.images && product.images.length > 0 ? product.images[0].imageUrl : '/images/placeholder.png',
                        badge: 'FEATURED',
                        averageRating: product.averageRating,
                        reviewCount: product.reviewCount
                    }))
                    setHotBarItems(formattedProducts)
                }
            } catch (error) {
                console.error('Error fetching featured products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    // Fetch newest products
    useEffect(() => {
        const fetchNewestProducts = async () => {
            try {
                const response = await axios.get('/api/products/newest')
                if (response.data.success && response.data.products) {
                    const formattedProducts = response.data.products.map((product: Product) => ({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
                        image: product.images && product.images.length > 0 ? product.images[0].imageUrl : '/images/placeholder.png',
                        badge: 'NEW',
                        averageRating: product.averageRating,
                        reviewCount: product.reviewCount
                    }))
                    setNewestProducts(formattedProducts)
                }
            } catch (error) {
                console.error('Error fetching newest products:', error)
            } finally {
                setIsNewestLoading(false)
            }
        }

        fetchNewestProducts()
    }, [])

    // Fetch all products
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await axios.get('/api/products')
                if (response.data.success && response.data.products) {
                    const formattedProducts = response.data.products.map((product: Product) => ({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
                        image: product.images && product.images.length > 0 ? product.images[0].imageUrl : '/images/placeholder.png',
                        averageRating: product.averageRating,
                        reviewCount: product.reviewCount
                    }))
                    setAllProducts(formattedProducts)
                }
            } catch (error) {
                console.error('Error fetching all products:', error)
            } finally {
                setIsAllProductsLoading(false)
            }
        }

        fetchAllProducts()
    }, [])

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredSections.length)
    }, [featuredSections.length])

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredSections.length) % featuredSections.length)
    }

    const nextHotBarSlide = () => {
        setHotBarSlide((prev) => {
            const maxSlide = Math.max(0, hotBarItems.length - itemsPerView)
            return Math.min(prev + 1, maxSlide)
        })
    }

    const prevHotBarSlide = () => {
        setHotBarSlide((prev) => Math.max(prev - 1, 0))
    }

    const nextNewestSlide = () => {
        setNewestProductsSlide((prev) => {
            const maxSlide = Math.max(0, newestProducts.length - itemsPerView)
            return Math.min(prev + 1, maxSlide)
        })
    }

    const prevNewestSlide = () => {
        setNewestProductsSlide((prev) => Math.max(prev - 1, 0))
    }

    const nextAllProductsSlide = () => {
        setAllProductsSlide((prev) => {
            const maxSlide = Math.max(0, allProducts.length - itemsPerView)
            return Math.min(prev + 1, maxSlide)
        })
    }

    const prevAllProductsSlide = () => {
        setAllProductsSlide((prev) => Math.max(prev - 1, 0))
    }

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000)
        return () => clearInterval(interval)
    }, [nextSlide])

    // Product Card Component
    const ProductCard = ({ item }: { item: HotBarItem }) => (
        <div className={`w-full ${itemsPerView === 2 ? 'sm:w-1/2' : itemsPerView === 3 ? 'sm:w-1/2 lg:w-1/3' : ''} flex-none px-2 sm:px-3`}>
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-2 backdrop-blur-sm border border-gray-100">
                <Link href={`/products/${item.id}`}>
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="w-full h-44 sm:h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.badge && (
                        <span className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg ${
                            item.badge === 'FEATURED' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        }`}>
                            {item.badge}
                        </span>
                    )}
                </div>
                <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1 flex-1">{item.name}</h3>
                        <div className="flex items-center ml-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                                {item.averageRating > 0 ? item.averageRating.toFixed(1) : '0.0'}
                            </span>
                            {item.reviewCount > 0 ? (
                                <span className="text-xs text-gray-500 ml-1">
                                    ({item.reviewCount})
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500 ml-1">
                                    (ไม่มีรีวิว)
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                                ฿{item.price.toLocaleString()}
                            </span>
                            {item.comparePrice && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through">
                                    ฿{item.comparePrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2.5 sm:p-3 rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
                </Link>
            </div>
        </div>
    )

    // Loading Skeleton Component
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(itemsPerView)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg animate-pulse">
                    <div className="w-full h-44 sm:h-52 bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-1/2" />
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4" />
                            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Popular Categories Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">หมวดหมู่ยอดนิยม</h2>
              <p className="text-gray-600 text-sm sm:text-base">เลือกซื้อสินค้าตามหมวดหมู่ที่คุณชื่นชอบ</p>
            </div>
            <Link href="/allcategories" className="group">
              <button className="text-sm sm:text-base text-gray-600 hover:text-orange-600 flex items-center font-medium transition-all duration-300 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg">
                ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 sm:space-x-8 pb-4 scrollbar-hide">
              {isCategoriesLoading ? (
                // Loading skeleton for categories
                [...Array(8)].map((_, index) => (
                  <div key={index} className="flex-none w-28 sm:w-32 md:w-36 text-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg" />
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20 sm:w-24 mx-auto animate-pulse" />
                  </div>
                ))
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex-none w-28 sm:w-32 md:w-36 text-center group cursor-pointer">
                    <Link href={`/allcategories/${category.id}`}>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-white">
                      <Image
                        src={category.imageUrl || '/api/placeholder/120/120'}
                        alt={category.name}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2 leading-relaxed">
                      {category.name}
                    </p>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections Carousel */}
      <section className="py-8 sm:py-12 px-4">
          <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl shadow-2xl">
                  <div
                      className="flex transition-transform duration-700 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                      {featuredSections.map((section) => (
                          <div key={section.id} className="w-full flex-none">
                              <div className={`${section.color} relative overflow-hidden rounded-3xl sm:rounded-4xl`}>
                                  <div className="flex flex-col md:flex-row items-center min-h-[350px] md:min-h-[400px]">
                                      <div className="flex-1 p-8 sm:p-12 md:p-16 w-full md:w-1/2">
                                          <div className="space-y-4">
                                              {section.subtitle && (
                                                  <p className={`text-base sm:text-lg font-semibold ${section.textColor} opacity-80 tracking-wide`}>
                                                      {section.subtitle}
                                                  </p>
                                              )}
                                              <h3 className={`text-3xl sm:text-4xl md:text-5xl font-black ${section.textColor} leading-tight tracking-tight`}>
                                                  {section.title}
                                              </h3>
                                          </div>
                                          <button className="mt-6 sm:mt-8 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105">
                                              เลือกซื้อ →
                                          </button>
                                      </div>
                                      <div className="w-full md:w-1/2 relative">
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                          <Image
                                              src={section.image}
                                              alt={section.title}
                                              width={600}
                                              height={400}
                                              className="w-full h-56 sm:h-72 md:h-96 object-cover"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Navigation Buttons */}
                  <button
                      onClick={prevSlide}
                      className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                  >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>
                  <button
                      onClick={nextSlide}
                      className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                  >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                      {featuredSections.map((_, index) => (
                          <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                                  index === currentSlide 
                                      ? 'bg-white shadow-lg scale-125' 
                                      : 'bg-white/60 hover:bg-white/80'
                              }`}
                          />
                      ))}
                  </div>
              </div>
          </div>
      </section>
        
      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                  <div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">สินค้าแนะนำ</h2>
                      <p className="text-gray-600 text-sm sm:text-base">สินค้าคุณภาพที่เราแนะนำเป็นพิเศษ</p>
                  </div>
                  <div className="flex items-center space-x-3">
                      <Link href="/allfeatures" className="group">
                          <button className="text-sm sm:text-base text-gray-600 hover:text-purple-600 flex items-center font-medium transition-all duration-300 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg">
                              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </button>
                      </Link>
                      <button
                          onClick={prevHotBarSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={hotBarSlide === 0 || isLoading || hotBarItems.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                      <button
                          onClick={nextHotBarSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={hotBarSlide >= Math.max(0, hotBarItems.length - itemsPerView) || isLoading || hotBarItems.length <= itemsPerView}
                      >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                  </div>
              </div>

              {isLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${hotBarSlide * (100 / itemsPerView)}%)` }}
                      >
                          {hotBarItems.map((item) => (
                              <ProductCard key={item.id} item={item} />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </section>

      {/* News Products Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                  <div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">สินค้าใหม่ล่าสุด</h2>
                      <p className="text-gray-600 text-sm sm:text-base">สินค้าใหม่ที่เพิ่งเข้ามาใหม่</p>
                  </div>
                  <div className="flex items-center space-x-3">
                      <Link href="/allfeatures" className="group">
                          <button className="text-sm sm:text-base text-gray-600 hover:text-emerald-600 flex items-center font-medium transition-all duration-300 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg">
                             ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </button>
                      </Link>
                      <button
                          onClick={prevNewestSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={newestProductsSlide === 0 || isNewestLoading || newestProducts.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                      <button
                          onClick={nextNewestSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={newestProductsSlide >= Math.max(0, newestProducts.length - itemsPerView) || isNewestLoading || newestProducts.length <= itemsPerView}
                      >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                  </div>
              </div>

              {isNewestLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${newestProductsSlide * (100 / itemsPerView)}%)` }}
                      >
                          {newestProducts.map((item) => (
                              <ProductCard key={item.id} item={item} />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </section>

      {/* All Products Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                  <div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">สินค้าของเรา</h2>
                      <p className="text-gray-600 text-sm sm:text-base">สินค้าทั้งหมดในร้านของเรา</p>
                  </div>
                  <div className="flex items-center space-x-3">
                      <Link href="/products" className="group">
                          <button className="text-sm sm:text-base text-gray-600 hover:text-orange-600 flex items-center font-medium transition-all duration-300 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg">
                              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </button>
                      </Link>
                      <button
                          onClick={prevAllProductsSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={allProductsSlide === 0 || isAllProductsLoading || allProducts.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                      <button
                          onClick={nextAllProductsSlide}
                          className="p-2.5 sm:p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
                          disabled={allProductsSlide >= Math.max(0, allProducts.length - itemsPerView) || isAllProductsLoading || allProducts.length <= itemsPerView}
                      >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                  </div>
              </div>

              {isAllProductsLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${allProductsSlide * (100 / itemsPerView)}%)` }}
                      >
                          {allProducts.map((item) => (
                              <ProductCard key={item.id} item={item} />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </section>
  </div>
)
}