'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    comparePrice: string | null;
    sku: string | null;
    stock: number;
    weight: string | null;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
    images: Array<{
        id: string;
        imageUrl: string;
        altText: string | null;
        sortOrder: number;
    }>;
    category: {
        id: string;
        name: string;
        isActive: boolean;
    };
}

export default function AllFeaturesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get('/api/products/featured');
                console.log('API Response:', response.data);
                
                if (response.data?.success && Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                    console.log('Fetched products in AllFeaturesPage:', response.data.products);
                } else {
                    console.warn('Invalid response format:', response.data);
                    setProducts([]);
                    setError('Invalid data format received');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setProducts([]);
                
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Network error occurred');
                } else {
                    setError('An unexpected error occurred while fetching products');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, []);

    const ProductCard = ({ product }: { product: Product }) => (
        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 relative shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {product.isFeatured && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10 font-medium">
                    FEATURED
                </div>
            )}

            {/* Product Image - Responsive aspect ratio */}
            <div className="bg-gray-200 rounded-lg sm:rounded-xl h-28 xs:h-32 sm:h-36 md:h-40 lg:h-44 mb-2 sm:mb-3 flex items-center justify-center relative overflow-hidden group">
                <Image 
                    src={product.images?.[0]?.imageUrl || '/images/placeholder.png'} 
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-105"
                    width={128}
                    height={128}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.png';
                    }}
                />
                {/* Add to cart button - responsive size */}
                <button className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95">
                    <Plus size={12} className="sm:w-4 sm:h-4 text-gray-600" />
                </button>
            </div>

            {/* Product Info - Responsive text sizes */}
            <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">EREWHON</p>
                <h3 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                    {product.name}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <p className="text-gray-900 font-semibold text-sm sm:text-base md:text-lg">
                        ฿{parseInt(product.price).toLocaleString()}
                    </p>
                    {product.comparePrice && parseInt(product.comparePrice) > parseInt(product.price) && (
                        <p className="text-xs sm:text-sm text-gray-500 line-through">
                            ฿{parseInt(product.comparePrice).toLocaleString()}
                        </p>
                    )}
                </div>
                {product.category && (
                    <p className="text-xs text-gray-400 truncate">{product.category.name}</p>
                )}
            </div>
        </div>
    );

    const ProductGrid = ({ products, isLoading }: { products: Product[], isLoading: boolean }) => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 relative animate-pulse">
                            <div className="bg-gray-200 rounded-lg sm:rounded-xl h-28 xs:h-32 sm:h-36 md:h-40 lg:h-44 mb-2 sm:mb-3"></div>
                            <div className="space-y-1 sm:space-y-2">
                                <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
                                <Skeleton className="h-3 sm:h-4 w-3/4" />
                                <Skeleton className="h-3 sm:h-4 w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-8 sm:py-12 px-4">
                    <div className="mb-3 sm:mb-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                        </svg>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg">ไม่มีสินค้าแนะนำในขณะนี้</p>
                    <p className="text-gray-500 text-sm mt-1 sm:mt-2">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} passHref>
                        <ProductCard product={product} />
                    </Link>
                ))}
            </div>
        );
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-6">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white w-full">
            {/* Container with responsive padding */}
            <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">

                {/* Page Title */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        สินค้าแนะนำ
                    </h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">สินค้าคุณภาพดีที่คัดสรรมาเพื่อคุณ</p>
                </div>

                {/* Products Grid */}
                <div className="space-y-8 sm:space-y-12">
                    <ProductGrid products={products} isLoading={loading} />
                </div>
            </div>
        </div>
    );
}