import AllCategoriesPage from '@/components/AllCategoriesPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import React from 'react'

export default function page() {
    return (
        <div>
            <Navbar />
            <div className="pt-16">
                <AllCategoriesPage />
            </div>
            <Footer />
        </div>
    )
}
