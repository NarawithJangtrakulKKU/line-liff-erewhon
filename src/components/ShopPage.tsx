"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

interface Smoothie {
    id: number;
    name: string;
    price: string;
    image: string;
    color: string;
    isNew: boolean;
}

export default function ShopPage() {
    const [activeTab, setActiveTab] = useState('SIGNATURES');

    const signaturesData = [
        {
            id: 1,
            name: "Hailey Bieber's Strawberry Glaze Skin Smoothie",
            price: "$20.00",
            image: "/api/placeholder/200/250",
            color: "bg-pink-200",
            isNew: false
        },
        {
            id: 2,
            name: "Malibu Mango Smoothie",
            price: "$19.00",
            image: "/api/placeholder/200/250",
            color: "bg-yellow-200",
            isNew: false
        },
        {
            id: 3,
            name: "Coconut Cloud Smoothie",
            price: "$19.00",
            image: "/api/placeholder/200/250",
            color: "bg-blue-200",
            isNew: false
        },
        {
            id: 4,
            name: "The CRAP Smoothie",
            price: "$11.00",
            image: "/api/placeholder/200/250",
            color: "bg-purple-200",
            isNew: false
        },
        {
            id: 5,
            name: "Vanilla Matcha Smoothie",
            price: "$21.00",
            image: "/api/placeholder/200/250",
            color: "bg-green-200",
            isNew: false
        },
        {
            id: 6,
            name: "Sincerely, Smoothie by Kali Uchis",
            price: "$23.00",
            image: "/api/placeholder/200/250",
            color: "bg-gradient-to-b from-purple-200 to-orange-200",
            isNew: true
        }
    ];

    const classicsData = [
        {
            id: 7,
            name: "Peanut Butter Blast",
            price: "$16.00",
            image: "/api/placeholder/200/250",
            color: "bg-amber-100",
            isNew: false
        },
        {
            id: 8,
            name: "Custom Smoothie",
            price: "$8.00",
            image: "/api/placeholder/200/250",
            color: "bg-pink-200",
            isNew: false
        },
        {
            id: 9,
            name: "Turmeric Crush",
            price: "$16.00",
            image: "/api/placeholder/200/250",
            color: "bg-orange-300",
            isNew: false
        },
        {
            id: 10,
            name: "Energy Elixir",
            price: "$16.00",
            image: "/api/placeholder/200/250",
            color: "bg-pink-300",
            isNew: false
        },
        {
            id: 11,
            name: "Almond Butter Blast",
            price: "$16.00",
            image: "/api/placeholder/200/250",
            color: "bg-amber-200",
            isNew: false
        },
        {
            id: 12,
            name: "The Goddess Smoothie",
            price: "$19.00",
            image: "/api/placeholder/200/250",
            color: "bg-green-600",
            isNew: false
        }
    ];

    const SmoothieCard = ({ smoothie }: { smoothie: Smoothie }) => (
        <div className="bg-gray-50 rounded-2xl p-4 relative">
            {smoothie.isNew && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full z-10">
                    NEW
                </div>
            )}

            <div className={`${smoothie.color} rounded-xl h-48 mb-4 flex items-center justify-center relative overflow-hidden`}>
                <div className="w-24 h-32 bg-white rounded-t-full rounded-b-sm shadow-md flex items-center justify-center">
                    <div className="text-xs font-bold text-gray-800 transform -rotate-12">
                        EREWHON
                    </div>
                </div>
                <button className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                    <Plus size={16} className="text-gray-600" />
                </button>
            </div>

            <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">EREWHON</p>
                <h3 className="font-medium text-gray-900 text-sm leading-tight">{smoothie.name}</h3>
                <p className="text-gray-600 font-semibold">{smoothie.price}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white w-[80vw] pt-20 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/allcategories" className="p-2 inline-flex items-center">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
        
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('SIGNATURES')}
                        className={`pb-2 text-sm font-medium ${activeTab === 'SIGNATURES'
                            ? 'text-black border-b-2 border-black'
                            : 'text-gray-500'
                            }`}
                    >
                        SIGNATURES
                    </button>
                    <button
                        onClick={() => setActiveTab('CLASSICS')}
                        className={`pb-2 text-sm font-medium ${activeTab === 'CLASSICS'
                            ? 'text-black border-b-2 border-black'
                            : 'text-gray-500'
                            }`}
                    >
                        CLASSICS
                    </button>
                </div>

                <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Signatures Section */}
                {activeTab === 'SIGNATURES' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Signatures</h2>
                            <Link href="/signatures" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                <span>View All</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {signaturesData.map((smoothie) => (
                                <SmoothieCard key={smoothie.id} smoothie={smoothie} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Classics Section */}
                {activeTab === 'CLASSICS' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Classics</h2>
                            <Link href="/classics" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                <span>View All</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {classicsData.map((smoothie) => (
                                <SmoothieCard key={smoothie.id} smoothie={smoothie} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Show both sections when SIGNATURES is active (like in original design) */}
                {activeTab === 'SIGNATURES' && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Classics</h2>
                            <Link href="/classics" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                <span>View All</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {classicsData.map((smoothie) => (
                                <SmoothieCard key={smoothie.id} smoothie={smoothie} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};