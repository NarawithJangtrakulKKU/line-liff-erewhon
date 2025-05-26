import React from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminProductsPage from '@/components/AdminProductsPage'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminProductsPage />
    </div>
  )
}
