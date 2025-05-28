"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingBag } from 'lucide-react';
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

    // Filter featured products
    const featuredProducts = React.useMemo(() => {
        return products.filter(product => product.isFeatured);
    }, [products]);

    const ProductCard = ({ product }: { product: Product }) => (
        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 relative shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {product.isFeatured && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10 font-medium">
                    FEATURED
                </div>
            )}

            {/* Product Image - Responsive aspect ratio */}
            <div className="bg-gray-200 rounded-lg sm:rounded-xl h-28 xs:h-32 sm:h-36 md:h-40 lg:h-44 mb-2 sm:mb-3 flex items-center justify-center relative overflow-hidden group">
                <img 
                    src={product.images[0]?.imageUrl || '/images/placeholder.png'} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-105"
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
                        ฿{product.price.toLocaleString()}
                    </p>
                    {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-xs sm:text-sm text-gray-500 line-through">
                            ฿{product.comparePrice.toLocaleString()}
                        </p>
                    )}
                </div>
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
                    <p className="text-gray-600 text-base sm:text-lg">ไม่พบสินค้าในหมวดหมู่นี้</p>
                    <p className="text-gray-500 text-sm mt-1 sm:mt-2">ลองเลือกหมวดหมู่อื่นดู</p>
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
                    <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
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
                
                {/* Back Button (Mobile) */}
                <div className="block sm:hidden mb-4">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm">กลับ</span>
                    </button>
                </div>

                {/* Category Title */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Back Button (Desktop) */}
                        <button 
                            onClick={() => window.history.back()}
                            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                {loadingCategory ? (
                                    <Skeleton className="h-8 sm:h-10 w-32 sm:w-48" />
                                ) : (
                                    categoryName
                                )}
                            </h1>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                                สินค้าในหมวดหมู่ {!loadingCategory && categoryName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 sm:space-y-12">
                    {/* Featured Products Section */}
                    {(!loadingProducts && featuredProducts.length > 0) && (
                        <div>
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                    สินค้าแนะนำ
                                </h2>
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                    <span>{featuredProducts.length} รายการ</span>
                                </div>
                            </div>
                            <ProductGrid products={featuredProducts} isLoading={false} />
                        </div>
                    )}
                    
                    {/* All Products Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                สินค้าทั้งหมด
                            </h2>
                            {!loadingProducts && (
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                    <span>{products.length} รายการ</span>
                                </div>
                            )}
                        </div>
                        <ProductGrid products={products} isLoading={loadingProducts} />
                    </div>
                </div>

                {/* Bottom Spacing for Mobile Navigation */}
                <div className="h-20 sm:h-8"></div>
            </div>
        </div>
    );
};