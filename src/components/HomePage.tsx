'use client'

import { useEffect, useState } from 'react'

type Category = {
    id: number
    name: string
    imageUrl: string
}

type Product = {
    id: number
    name: string
    imageUrl: string
    price: number
    originalPrice?: number
    isFeatured: boolean
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch('/api/popular-categories'),
                    fetch('/api/featured-products'),
                ])
                const [catData, prodData] = await Promise.all([
                    catRes.json(),
                    prodRes.json(),
                ])
                setCategories(catData)
                setProducts(prodData)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="px-6 py-10 space-y-12 justify-center w-[80%] mx-auto pt-20">
            {/* Popular Categories */}
            <section>
                <div className="flex justify-between items-center mb-4 ">
                    <h2 className="text-xl md:text-2xl font-bold">Popular Categories</h2>
                    <a href="/categories" className="text-sm text-gray-500 hover:underline">
                        View All &gt;
                    </a>
                </div>

                {loading ? (
                    <p>Loading categories...</p>
                ) : (
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex-shrink-0 text-center w-20">
                                <img
                                    src={cat.imageUrl}
                                    alt={cat.name}
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                                <p className="text-sm mt-2 truncate">{cat.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Featured Products */}
            <section className="bg-gray-50 rounded-xl  ">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold">Featured Products</h2>
                    <a href="/products" className="text-sm text-gray-500 hover:underline">
                        View All &gt;
                    </a>
                </div>

                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((prod) => (
                            <div
                                key={prod.id}
                                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
                            >
                                <div className="relative">
                                    {prod.isFeatured && (
                                        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                                            FEATURED
                                        </span>
                                    )}
                                    <img
                                        src={prod.imageUrl}
                                        alt={prod.name}
                                        className="w-full h-40 object-cover rounded"
                                    />
                                </div>
                                <div className="mt-4 space-y-1">
                                    <h3 className="font-semibold">{prod.name}</h3>
                                    <p className="text-sm text-gray-500">For Sale</p>
                                    <p className="text-base font-bold text-black">
                                        ${prod.price.toFixed(2)}{' '}
                                        {prod.originalPrice && (
                                            <span className="line-through text-gray-400 text-sm ml-2">
                                                ${prod.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
