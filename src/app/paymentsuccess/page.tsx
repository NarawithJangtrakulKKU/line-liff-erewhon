import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PaymentSuccess from '@/components/PaymentSuccess'
import React from 'react'

export default function Page() {
  return (
    <div>
        <Navbar /> 
        <PaymentSuccess />
        <Footer />
    </div>
  )
}
