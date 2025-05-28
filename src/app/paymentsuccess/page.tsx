import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PaymentSuccess from '@/components/PaymentSuccess'
import React from 'react'

// PaymentSuccess page
// Usage: /paymentsuccess?orderId=<order_id>
// Example: /paymentsuccess?orderId=cm123abc456def
export default function Page() {
  return (
    <div>
        <Navbar /> 
        <PaymentSuccess />
        <Footer />
    </div>
  )
}
