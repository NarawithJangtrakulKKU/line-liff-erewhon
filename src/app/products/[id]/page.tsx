
// app/products/[id]/page.tsx
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProductViewPage from '@/components/ProductViewPage'
import React from 'react'

// แก้ไข: เปลี่ยน params เป็น Promise และทำให้ component เป็น async
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // แก้ไข: await params ก่อนใช้งาน
  const { id } = await params;
  
  return (
    <div>
        <Navbar />
        <div className='pt-16'>
            <ProductViewPage productId={id} />
        </div>
        <Footer />
    </div>
  )
}