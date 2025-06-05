"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, Plus, Filter, Grid, List, Search, Star, ShoppingBag, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    comparePrice?: number | null;
    images: { imageUrl: string; }[];
    isFeatured: boolean;
    stock?: number;
    category: {
      id: string;
      name: string;
    } | null;
}

interface CategoriesPageProps {
    categoryId: string;
}

export default function CategoriesPage({ categoryId }: CategoriesPageProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState('Loading...');
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'featured'>('featured');
    const [searchQuery, setSearchQuery] = useState('');

    console.log('Received categoryId prop in CategoriesPage:', categoryId);

    useEffect(() => {
        // Fetch category details to get the name
        const fetchCategoryDetails = async () => {
            try {
                setLoadingCategory(true);
                const response = await axios.get(`/api/admin/categories/${categoryId}`); 
                if (response.data.success && response.data.category) {
                    setCategoryName(response.data.category.name);
                } else {
                    setCategoryName('Unknown Category');
                    console.error('Failed to fetch category details', response.data);
                }
            } catch (err) {
                setCategoryName('Error Loading Category');
                console.error('Error fetching category details:', err);
            } finally {
                setLoadingCategory(false);
            }
        };

        // Fetch products for this category
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await axios.get(`/api/products/category/${categoryId}`);
                
                console.log('Fetched products for category:', categoryId, response.data.products);

                if (response.data.success) {
                    setProducts(response.data.products || []);
                } else {
                    setError('Failed to fetch products for category');
                }
            } catch (err) {
                setError('An error occurred while fetching products for category');
                console.error('Error fetching products for category:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchCategoryDetails();
        fetchProducts();

    }, [categoryId]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Sort products
        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'featured':
                filtered.sort((a, b) => {
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return 0;
                });
                break;
        }

        return filtered;
    }, [products, searchQuery, sortBy]);

    // Filter featured products
    const featuredProducts = useMemo(() => {
        return filteredAndSortedProducts.filter(product => product.isFeatured);
    }, [filteredAndSortedProducts]);

    const ProductCard = ({ product }: { product: Product }) => (
        <div className="group relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg lg:hover:shadow-xl transition-all duration-300 lg:duration-500 hover:-translate-y-0.5 lg:hover:-translate-y-1 border border-gray-100">
            <Link href={`/products/${product.id}`} className="block">
                {/* Product Image Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="aspect-square relative">
                        <Image 
                            src={product.images[0]?.imageUrl || '/images/placeholder.png'} 
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 lg:duration-700 group-hover:scale-105 lg:group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.png';
                            }}
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Featured Badge */}
                        {product.isFeatured && (
                            <div className="absolute top-1.5 sm:top-2 lg:top-3 left-1.5 sm:left-2 lg:left-3">
                                <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold px-1.5 sm:px-2 lg:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                                    <span className="hidden sm:inline">FEATURED</span>
                                </div>
                            </div>
                        )}

                        {/* Price Badge */}
                        {product.comparePrice && product.comparePrice > product.price && (
                            <div className="absolute top-1.5 sm:top-2 lg:top-3 right-1.5 sm:right-2 lg:right-3">
                                <div className="bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                                    SALE
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
                                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                            </button>
                            <button className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
                                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 lg:p-4 space-y-2 lg:space-y-3">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base leading-tight line-clamp-2 lg:line-clamp-3 group-hover:text-orange-600 transition-colors duration-300">
                            {product.name}
                        </h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                                    ฿{product.price.toLocaleString()}
                                </span>
                                {product.comparePrice && product.comparePrice > product.price && (
                                    <span className="text-xs sm:text-sm lg:text-base text-gray-500 line-through">
                                        ฿{product.comparePrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {product.comparePrice && product.comparePrice > product.price && (
                                <div className="text-xs lg:text-sm text-green-600 font-medium">
                                    Save ฿{(product.comparePrice - product.price).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    const ProductListItem = ({ product }: { product: Product }) => (
        <div className="group bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <Link href={`/products/${product.id}`} className="flex p-3 sm:p-4 gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image 
                        src={product.images[0]?.imageUrl || '/images/placeholder.png'} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.png';
                        }}
                    />
                    {product.isFeatured && (
                        <div className="absolute top-1 left-1">
                            <Star className="w-3 h-3 text-orange-500 fill-current" />
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg group-hover:text-orange-600 transition-colors duration-300 line-clamp-1 lg:line-clamp-2">
                                {product.name}
                            </h3>
                        </div>
                        <div className="text-right ml-3 sm:ml-4">
                            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">
                                ฿{product.price.toLocaleString()}
                            </div>
                            {product.comparePrice && product.comparePrice > product.price && (
                                <div className="text-xs sm:text-sm lg:text-base text-gray-500 line-through">
                                    ฿{product.comparePrice.toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {product.description && (
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600 line-clamp-2 lg:line-clamp-3 mb-2 sm:mb-3">
                            {product.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {product.isFeatured && (
                                <span className="bg-orange-100 text-orange-800 text-xs lg:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                                    Featured
                                </span>
                            )}
                            {product.comparePrice && product.comparePrice > product.price && (
                                <span className="bg-red-100 text-red-800 text-xs lg:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                                    Sale
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </button>
                            <button className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-full items-center justify-center transition-all duration-300">
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    const ProductGrid = ({ products, isLoading, viewMode }: { products: Product[], isLoading: boolean, viewMode: 'grid' | 'list' }) => {
        if (isLoading) {
            return (
                <div className={viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 xl:gap-6"
                    : "space-y-3 sm:space-y-4"
                }>
                    {Array.from({ length: viewMode === 'grid' ? 12 : 8 }).map((_, index) => (
                        <div key={index} className={viewMode === 'grid'
                            ? "bg-white rounded-xl lg:rounded-2xl p-2 sm:p-3 animate-pulse"
                            : "bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse flex gap-3 sm:gap-4"
                        }>
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="aspect-square bg-gray-200 rounded-lg lg:rounded-xl mb-2 sm:mb-3"></div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Skeleton className="h-3 sm:h-4 w-full" />
                                        <Skeleton className="h-3 sm:h-4 w-1/2" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1 space-y-1.5 sm:space-y-2">
                                        <Skeleton className="h-4 sm:h-5 w-3/4" />
                                        <Skeleton className="h-3 sm:h-4 w-full hidden sm:block" />
                                        <Skeleton className="h-3 sm:h-4 w-2/3" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-12 sm:py-16 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">ไม่พบสินค้าในหมวดหมู่นี้</h3>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors duration-300 font-medium text-sm sm:text-base"
                    >
                        ดูสินค้าทั้งหมด
                    </button>
                </div>
            );
        }

        return (
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 xl:gap-6"
                : "space-y-3 sm:space-y-4"
            }>
                {products.map((product) => (
                    viewMode === 'grid' ? (
                        <ProductCard key={product.id} product={product} />
                    ) : (
                        <ProductListItem key={product.id} product={product} />
                    )
                ))}
            </div>
        );
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-sm sm:max-w-md mx-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors duration-300 font-medium text-sm sm:text-base"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header Section */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    {/* Mobile Back Button */}
                    <div className="block sm:hidden mb-3">
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <ChevronLeft size={18} />
                            <span className="text-sm font-medium">กลับ</span>
                        </button>
                    </div>

                    {/* Category Title and Controls */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Desktop Back Button */}
                            <button 
                                onClick={() => window.history.back()}
                                className="hidden sm:flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                            >
                                <ChevronLeft size={18} className="lg:w-5 lg:h-5 text-gray-600 group-hover:text-gray-900" />
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                {loadingCategory ? (
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Skeleton className="h-6 sm:h-7 lg:h-8 w-32 sm:w-48" />
                                        <Skeleton className="h-3 sm:h-4 w-20 sm:w-32" />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 line-clamp-1 lg:line-clamp-none">
                                            {categoryName}
                                        </h1>
                                        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                                            {!loadingProducts && `${filteredAndSortedProducts.length} สินค้า`}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {/* Search */}
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาสินค้า..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                >
                                    <option value="featured">แนะนำ</option>
                                    <option value="name">ชื่อ A-Z</option>
                                    <option value="price-low">ราคาต่ำ-สูง</option>
                                    <option value="price-high">ราคาสูง-ต่ำ</option>
                                </select>

                                {/* View Mode */}
                                <div className="flex bg-gray-100 rounded-full p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                                            viewMode === 'grid' 
                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Grid size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                                            viewMode === 'list' 
                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <List size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                    {/* Featured Products Section */}
                    {(!loadingProducts && featuredProducts.length > 0) && (
                        <div>
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                                        ⭐ สินค้าแนะนำ
                                    </h2>
                                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                                        สินค้าคุณภาพที่เราคัดสรรมาเป็นพิเศษ
                                    </p>
                                </div>
                                <div className="text-xs sm:text-sm lg:text-base text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                                    {featuredProducts.length} รายการ
                                </div>
                            </div>
                            <ProductGrid products={featuredProducts} isLoading={false} viewMode="grid" />
                        </div>
                    )}
                    
                    {/* All Products Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                                    {searchQuery ? `ผลการค้นหา: "${searchQuery}"` : 'สินค้าทั้งหมด'}
                                </h2>
                                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                                    {searchQuery ? 'สินค้าที่ตรงกับการค้นหาของคุณ' : `สินค้าทั้งหมดในหมวดหมู่ ${categoryName}`}
                                </p>
                            </div>
                            {!loadingProducts && (
                                <div className="text-xs sm:text-sm lg:text-base text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                                    {filteredAndSortedProducts.length} รายการ
                                </div>
                            )}
                        </div>
                        <ProductGrid products={filteredAndSortedProducts} isLoading={loadingProducts} viewMode={viewMode} />
                    </div>
                </div>

                {/* Bottom Spacing for Mobile Navigation */}
                <div className="h-16 sm:h-8"></div>
            </div>
        </div>
    );
};