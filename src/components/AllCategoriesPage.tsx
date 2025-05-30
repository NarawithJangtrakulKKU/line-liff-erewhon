'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import axios from 'axios'

interface Category {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
}

export default function AllCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                if (response.data.success) {
                    setCategories(response.data.categories);
                    console.log('Fetched categories in AllCategoriesPage:', response.data.categories);
                } else {
                    setError('Failed to fetch categories');
                }
            } catch (err) {
                setError('An error occurred while fetching categories');
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Hero Sections */}
            <div className="container mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="#" className="block">
                    <div className="relative overflow-hidden rounded-2xl h-32 md:h-40 lg:h-48 bg-gray-300">
                        <Image 
                            src="/images/carousel/pexels-ash-craig-122861-376464.jpg" 
                            alt="The Cafe" 
                            width={400}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        />
                    </div>
                </a>
                <a href="#" className="block">
                    <div className="relative overflow-hidden rounded-2xl h-32 md:h-40 lg:h-48 bg-gray-300">
                        <Image 
                            src="/images/carousel/pexels-ella-olsson-572949-1640777.jpg" 
                            alt="The Tonic Bar" 
                            width={400}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        />
                    </div>
                </a>
            </div>

            {/* Category Grid */}
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl mb-3" />
                                <Skeleton className="w-16 h-4 sm:w-20 sm:h-5 rounded mb-1" />
                            </div>
                        ))
                    ) : (
                        categories.map((category) => (
                            <a 
                                key={category.id} 
                                href={`/allcategories/${category.id}`}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-100 mb-3 group-hover:scale-105 transition-transform">
                                    <Image 
                                        src={category.imageUrl || '/images/placeholder.png'} 
                                        alt={category.name} 
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <span className="text-center text-xs sm:text-base md:text-lg font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                                    {category.name}
                                </span>
                            </a>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
