import React from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminUserPage from '@/components/AdminUserPage'


export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminUserPage />
    </div>
  )
}
