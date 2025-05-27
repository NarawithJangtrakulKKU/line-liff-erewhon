import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import UserSettingPage from '@/components/UserSettingPage'
import React from 'react'

export default function Page() {
  return (
    <div>
        <Navbar />
        <div className='pt-16'>
          <UserSettingPage />
        </div>
        <Footer />
    </div>
  )
}
