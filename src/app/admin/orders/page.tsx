import React from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminOrdersPage from '@/components/AdminOrdersPage'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminOrdersPage />
    </div>
  )
}
