import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProductsPage from '@/components/ProductsPage'
import React from 'react'

export default function Page() {
  return (
    <div>
        <Navbar />
        <div className='pt-16'>
            <ProductsPage />
        </div>
        <Footer />
    </div>
  )
}
