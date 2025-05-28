import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import MyOrdersPage from '@/components/MyOrdersPage'
import React from 'react'

export default function Page() {
  return (
    <div>
        <Navbar />
        <div className='pt-5'>
            <MyOrdersPage />
        </div>
        <Footer />
    </div>
  )
}
