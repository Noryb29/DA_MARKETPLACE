import React from 'react'
import FarmerSidebar from './components/FarmerSidebar'

const FarmerOrders = () => {
  return (
    <div className='min-h-screen'>
      <div className='flex' style={{ minHeight: 'calc(100vh - 65px)'}}>
        <FarmerSidebar/>

      </div>
    </div>
  )
}

export default FarmerOrders
