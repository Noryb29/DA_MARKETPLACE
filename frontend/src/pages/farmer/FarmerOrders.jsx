import React, { useEffect, useState } from 'react'
import useOrderStore from '../../store/OrderStore'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import {
  Loader2,ClipboardList, 
} from 'lucide-react'
import Sidebar from '../public/components/SideBar'
import FarmerOrderCard from './components/FarmerOrderCard'


const FarmerOrders = () => {
  const { farmerOrders, loading, farmerInitialized, getFarmerOrders } = useOrderStore()
  const { farmer } = useFarmerAuthStore()

  useEffect(() => { getFarmerOrders() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>
        <main className="flex-1  overflow-y-auto">
          <div className="px-10 mt-10 mx-auto">

            <div className="mb-7">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <ClipboardList className="w-3.5 h-3.5" />
                Incoming Orders
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Incoming Orders</h1>
              <p className="text-gray-500 mt-1 text-sm">Orders placed for your crops.</p>
            </div>

            {/* Loading */}
            {loading && !farmerInitialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {/* Empty */}
            {farmerInitialized && farmerOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <ClipboardList className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No incoming orders yet</p>
                <p className="text-xs text-gray-400">Orders for your crops will appear here.</p>
              </div>
            )}

            {/* Orders */}
            {farmerInitialized && farmerOrders.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-medium mb-3">
                  {farmerOrders.length} incoming {farmerOrders.length === 1 ? 'order' : 'orders'}
                </p>
                {farmerOrders.map((order) => (
                  <FarmerOrderCard key={order.crop_order_id} order={order} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default FarmerOrders