import AdminReviewPage from '@/components/AdminReviewPage'
import AdminSidebar from '@/components/AdminSidebar'
import React from 'react'

export default function Page() {
  return (
    <div className="relative">
      <AdminSidebar />
      <AdminReviewPage />
    </div>
  )
}
