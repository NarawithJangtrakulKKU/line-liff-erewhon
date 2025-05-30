import Footer from '@/components/Footer'
import CategoriesPage from '@/components/CategoriesPage'
import Navbar from '@/components/Navbar'
import React from 'react'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const paramsId = await params;
    
  return (
    <div>
        <Navbar />
        <div className="pt-16">
            <CategoriesPage categoryId={paramsId.id} />
        </div>
        <Footer />
    </div>
  )
}
