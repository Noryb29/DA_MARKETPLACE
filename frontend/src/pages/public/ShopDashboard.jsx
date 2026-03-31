import React from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'

const ShopDashboard = () => {
  return (
    <div className='max-w-screen'>
        <Header/>
        <div>
            <Sidebar/>
        </div>
    </div>
  )
}

export default ShopDashboard