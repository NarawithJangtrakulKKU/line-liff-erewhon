import React from 'react'

export default function AllCategoriesPage() {


    const categories = [
        { name: "Beverages", image: "/images/Beverages.png" },
        { name: "Pantry", image: "/images/436e3b677d7a4394fdca3f35e8f731e5.webp" },
        { name: "Snacks & Candy", image: "/images/Snacks & Candy.png" },
        { name: "Produce", image: "/images/Produce.png" },
        { name: "Health & Wellness", image: "/images/Health & Wellness.png" },
        { name: "Dairy & Eggs", image: "/images/egg1.png" },
        { name: "Meat & Seafood", image: "/images/meatt.png" },
        { name: "Household", image: "/images/Household.png" },
        { name: "Personal Care & Beauty", image: "/images/Personal.png" },
        { name: "Breads", image: "/images/Breads.png" },
        { name: "Alcohol", image: "/images/alcohol.png" },
        { name: "Frozen", image: "/images/frozen.png" },
        { name: "Erewhon Merch", image: "/images/erewhon.png" },
        { name: "Home Care", image: "/images/home.png" },
        { name: "Other", image: "/images/other.png" },
    ];
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Hero Sections */}
            <div className="container mx-auto px-4 py-4 grid grid-cols-2 gap-4">
                <a href="#">
                    <div className="relative overflow-hidden rounded-lg h-32 md:h-40 bg-gray-300">
                        <img src="/images/thecafe.jpeg" alt="The Cafe" className="w-full h-full object-cover" />
                    </div>
                </a>
                <div className="relative overflow-hidden rounded-lg h-32 md:h-40 bg-gray-300">
                    <a href="#">
                        <img src="/images/thetonicbar.jpeg" alt="The Tonic Bar" className="w-full h-full object-cover" />
                    </a>

                </div>
            </div>

            {/* Category Grid */}
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {categories.map((category, index) => (
                        <a key={index} href={`/category/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="group">
                            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
                                <img src={category.image} alt={category.name} className="w-100 h-50 object-contain mb-2" />
                                <span className="text-center text-sm font-medium">{category.name}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

        </div>
    )
}
