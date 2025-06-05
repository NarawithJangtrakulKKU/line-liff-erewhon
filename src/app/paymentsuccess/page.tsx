import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PaymentSuccess from '@/components/PaymentSuccess'
import React, { Suspense } from 'react'

// PaymentSuccess page
// Usage: /paymentsuccess?orderId=<order_id>
// Example: /paymentsuccess?orderId=cm123abc456def
export default function Page() {
  return (
    <div>
        <Navbar /> 
        <Suspense fallback={<div className="min-h-screen bg-orange-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div></div>}>
          <PaymentSuccess />
        </Suspense>
        <Footer />
    </div>
  )
}
