import React from 'react'
import Sidebar from '../public/components/SideBar'

const FarmerInventory = () => {
  return (
    <div className='min-h-screen'>
      <div className='flex' style={{ minHeight: 'calc(100vh - 65px)'}}>
        <Sidebar/>

      </div>
    </div>
  )
}

export default FarmerInventory
