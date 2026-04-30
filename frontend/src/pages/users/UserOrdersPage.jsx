import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../public/components/Header'
import useOrderStore from '../../store/OrderStore'
import BuyerOrderCard from './components/BuyerOrderCard'
import BuyerOrderModal from './components/BuyerOrderModal'
import { Loader2, ClipboardList, Plus, ShoppingBag } from 'lucide-react'
import Sidebar from '../public/components/SideBar'

const UserOrdersPage = () => {
  const { myOrders, loading, initialized, getMyOrders } = useOrderStore()
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => { getMyOrders() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="mx-10">

            {/* Page Header */}
            <div className="mb-7 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                  <ClipboardList className="w-3.5 h-3.5" />
                  My Orders
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
                <p className="text-gray-500 mt-1 text-sm">Track all your crop purchases.</p>
              </div>
              <Link
                to="/user/shop"
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl
                  shadow-md shadow-green-200 active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Order
              </Link>
            </div>

            {/* Loading */}
            {loading && !initialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {/* Empty */}
            {initialized && myOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <ClipboardList className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No orders yet</p>
                <p className="text-xs text-gray-400">Orders will appear here once placed.</p>
              </div>
            )}

            {/* Count */}
            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-3">
                {myOrders.length} {myOrders.length === 1 ? 'order' : 'orders'}
              </p>
            )}

            {/* Order Cards */}
            {initialized && myOrders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {myOrders.map((order) => (
                  <BuyerOrderCard
                    key={order.crop_order_id}
                    order={order}
                    onViewDetails={setSelectedOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <BuyerOrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}

export default UserOrdersPage