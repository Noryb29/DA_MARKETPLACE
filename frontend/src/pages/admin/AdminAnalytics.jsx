import React from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'

const AdminAnalytics = () => {
  return (
    <div className='min-h-screen'>
      <Header/>
    
    <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar/>
      </div>
    </div>
  )
}

export default AdminAnalytics
