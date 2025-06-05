import AdminDashboardPage from '@/components/AdminDashboardPage'
import AdminSidebar from '@/components/AdminSidebar'
import React from 'react'

export default function Page() {
  return (
    <div className="relative">
      <AdminSidebar />
      <AdminDashboardPage />  
    </div>
  )
}
