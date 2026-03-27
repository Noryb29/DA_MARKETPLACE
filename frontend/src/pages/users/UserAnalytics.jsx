import React from 'react'
import Header from '../public/components/Header'
import UserSidebar from './components/UserSidebar'

const UserAnalytics = () => {
  return (
    <div className='min-h-screen'>
      <Header/>
      <div className='flex' style={{ minHeight: 'calc(100vh - 65px)'}}>
        <UserSidebar/>
      </div>
    </div>
  )
}

export default UserAnalytics
