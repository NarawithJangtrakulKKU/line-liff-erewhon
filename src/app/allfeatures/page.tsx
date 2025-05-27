import React from 'react'
import Navbar from '@/components/Navbar'
import AllFeaturesPage from '@/components/AllFeaturesPage'
import Footer from '@/components/Footer'

export default function Page() {
  return (
    <div>
        <Navbar />
        <div className='pt-16'>
          <AllFeaturesPage />
        </div>
        <Footer />
    </div>
  )
}
