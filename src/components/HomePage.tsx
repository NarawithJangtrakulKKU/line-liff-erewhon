'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight,ShoppingBag } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'

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
}

interface HotBarItem {
    id: string
    name: string
    description: string | null
    price: number
    comparePrice?: number | null
    image: string
    badge?: string
}

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    comparePrice?: number | null
    images?: { imageUrl: string }[]
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
            color: 'bg-pink-100',
            textColor: 'text-gray-800'
        },
        {
            id: 2,
            title: 'DAILY SPECIALS',
            subtitle: 'MONDAY',
            image: '/images/carousel/pexels-ella-olsson-572949-1640777.jpg',
            color: 'bg-orange-100',
            textColor: 'text-gray-800'
        },
        {
            id: 3,
            title: 'EAT IN SEASON',
            subtitle: '',
            image: '/images/carousel/pexels-janetrangdoan-1099680.jpg',
            color: 'bg-green-100',
            textColor: 'text-gray-800'
        },
        {
            id: 4,
            title: 'DAILY SPECIALS',
            subtitle: 'EXPLORE ESSENTIALS',
            image: '/images/carousel/pexels-robinstickel-70497.jpg',
            color: 'bg-yellow-100',
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
                        badge: 'FEATURED'
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
                        badge: 'NEW'
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
                        image: product.images && product.images.length > 0 ? product.images[0].imageUrl : '/images/placeholder.png'
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
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <Link href={`/products/${item.id}`}>
                <div className="relative">
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    {item.badge && (
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {item.badge}
                        </span>
                    )}
                </div>
                <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-base sm:text-lg">฿{item.price.toLocaleString()}</span>
                            {item.comparePrice && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through">
                                    ฿{item.comparePrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button className="bg-orange-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-orange-600 transition-colors">
                            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="w-full h-40 sm:h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-1/4" />
                            <div className="h-8 w-8 bg-gray-200 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-white">

      {/* Popular Categories Section */}
      <section className="py-6 sm:py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">หมวดหมู่ยอดนิยม</h2>
              <Link href="/allcategories" className="text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center">
                <button className="cursor-pointer text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center">
                  ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
          </div>
          
          <div className="relative">
            <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide">
              {isCategoriesLoading ? (
                // Loading skeleton for categories
                [...Array(8)].map((_, index) => (
                  <div key={index} className="flex-none w-24 sm:w-28 md:w-32 text-center">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 mx-auto mb-2 sm:mb-3 rounded-2xl bg-gray-200 animate-pulse" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mx-auto animate-pulse" />
                  </div>
                ))
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex-none w-24 sm:w-28 md:w-32 text-center group cursor-pointer">
                    <Link href={`/allcategories/${category.id}`}>
                    <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 mx-auto mb-2 sm:mb-3 rounded-2xl overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform">
                      <Image
                        src={category.imageUrl || '/api/placeholder/120/120'}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2">
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
      <section className="py-6 sm:py-8 px-4">
          <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                      {featuredSections.map((section) => (
                          <div key={section.id} className="w-full flex-none">
                              <div className={`${section.color} relative overflow-hidden rounded-xl sm:rounded-2xl`}>
                                  <div className="flex flex-col md:flex-row items-center">
                                      <div className="flex-1 p-6 sm:p-8 md:p-12 w-full md:w-1/2">
                                          <div className="space-y-2">
                                              {section.subtitle && (
                                                  <p className={`text-sm sm:text-base font-medium ${section.textColor} opacity-80`}>
                                                      {section.subtitle}
                                                  </p>
                                              )}
                                              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${section.textColor} leading-tight`}>
                                                  {section.title}
                                              </h3>
                                          </div>
                                          <button className="mt-4 sm:mt-6 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-800 transition-colors text-sm sm:text-base">
                                                      →
                                                  </button>
                                      </div>
                                      <div className="w-full md:w-1/2">
                                          <Image
                                              src={section.image}
                                              alt={section.title}
                                              width={500}
                                              height={300}
                                              className="w-full h-48 sm:h-64 md:h-80 object-cover"
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
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all"
                  >
                      <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  <button
                      onClick={nextSlide}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all"
                  >
                      <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
                      {featuredSections.map((_, index) => (
                          <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentSlide ? 'bg-gray-800' : 'bg-gray-400'
                                  }`}
                          />
                      ))}
                  </div>
              </div>
          </div>
      </section>
        
      {/* Featured Products Section */}
      <section className="py-6 sm:py-8 md:py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">สินค้าแนะนำ</h2>
                  <div className="flex items-center space-x-2">
                      <button className="text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center">
                          <Link href="/allfeatures">
                              ดูทั้งหมด
                          </Link>
                      </button>
                      <button
                          onClick={prevHotBarSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={hotBarSlide === 0 || isLoading || hotBarItems.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                          onClick={nextHotBarSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={hotBarSlide >= Math.max(0, hotBarItems.length - itemsPerView) || isLoading || hotBarItems.length <= itemsPerView}
                      >
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                  </div>
              </div>

              {isLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-300 ease-in-out"
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
      <section className="py-6 sm:py-8 md:py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">สินค้าใหม่ล่าสุด</h2>
                  <div className="flex items-center space-x-2">
                      <button className="text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center">
                          <Link href="/allfeatures">
                             ดูทั้งหมด
                          </Link>
                      </button>
                      <button
                          onClick={prevNewestSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={newestProductsSlide === 0 || isNewestLoading || newestProducts.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                          onClick={nextNewestSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={newestProductsSlide >= Math.max(0, newestProducts.length - itemsPerView) || isNewestLoading || newestProducts.length <= itemsPerView}
                      >
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                  </div>
              </div>

              {isNewestLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-300 ease-in-out"
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
      <section className="py-6 sm:py-8 md:py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">สินค้าของเรา</h2>
                  <div className="flex items-center space-x-2">
                      <button className="text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center">
                          <Link href="/products">
                              ดูทั้งหมด
                          </Link>
                      </button>
                      <button
                          onClick={prevAllProductsSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={allProductsSlide === 0 || isAllProductsLoading || allProducts.length <= itemsPerView}
                      >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                          onClick={nextAllProductsSlide}
                          className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={allProductsSlide >= Math.max(0, allProducts.length - itemsPerView) || isAllProductsLoading || allProducts.length <= itemsPerView}
                      >
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                  </div>
              </div>

              {isAllProductsLoading ? (
                  <LoadingSkeleton />
              ) : (
                  <div className="overflow-hidden">
                      <div
                          className="flex transition-transform duration-300 ease-in-out"
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