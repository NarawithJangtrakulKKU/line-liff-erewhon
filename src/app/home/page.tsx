import Footer from '@/components/Footer'
import HomePage from '@/components/HomePage'
import Navbar from '@/components/Navbar'

import React from 'react'

export default function Page() {
  return (
    <div>
      <Navbar />
      <div className="pt-16">
        <HomePage />
      </div>
      <Footer />
    </div>
  )
}
