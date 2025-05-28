import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PurchaseHistoryPage from '@/components/PurchaseHistoryPage'
import React from 'react'

export default function Page() {
  return (
    <div>
        <Navbar />
        <div className='pt-16'>
          <PurchaseHistoryPage />
        </div>
        <Footer />
    </div>
  )
}
