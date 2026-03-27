import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FarmerSidebar from './components/FarmerSidebar'

const FarmerProduce = () => {
  return (
    <div className='min-h-screen'>
      <div className='flex' style={{ minHeight: 'calc(100vh - 65px)'}}>
        <FarmerSidebar/>
      </div>
    </div>
  )
}

export default FarmerProduce
