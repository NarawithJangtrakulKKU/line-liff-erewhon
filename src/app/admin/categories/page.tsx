import AdminSidebar from '@/components/AdminSidebar'
import AdminCategoriesPage from '@/components/AdminCategoriesPage'
import React from 'react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminCategoriesPage />
    </div>
  )
}
