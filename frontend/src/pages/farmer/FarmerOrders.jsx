import React, { useEffect, useState, useMemo } from 'react'
import useOrderStore from '../../store/OrderStore'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import {
  Loader2, ClipboardList, Search, X, Filter, Package, CheckCircle, Clock, Truck, Leaf, DollarSign
} from 'lucide-react'
import Sidebar from '../public/components/SideBar'
import FarmerOrderCard from './components/FarmerOrderCard'


const FarmerOrders = () => {
  const { farmerOrders, loading, farmerInitialized, getFarmerOrders } = useOrderStore()
  const { farmer } = useFarmerAuthStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { getFarmerOrders() }, [])

  const filtered = useMemo(() => {
    let result = farmerOrders

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(o => 
        o.crop_name?.toLowerCase().includes(s) ||
        `${o.buyer_first_name} ${o.buyer_last_name}`.toLowerCase().includes(s) ||
        o.farm_name?.toLowerCase().includes(s)
      )
    }

    return result
  }, [farmerOrders, search, statusFilter])

  const stats = useMemo(() => {
    const total = farmerOrders.length
    const pending = farmerOrders.filter(o => o.status === 'pending').length
    const approved = farmerOrders.filter(o => o.status === 'approved').length
    const rejected = farmerOrders.filter(o => o.status === 'rejected').length
    const totalRevenue = farmerOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0)
    const totalVolume = farmerOrders.reduce((sum, o) => sum + (parseFloat(o.volume) || 0), 0)
    return { total, pending, approved, rejected, totalRevenue, totalVolume }
  }, [farmerOrders])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-600 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Incoming Orders</h1>
                  <p className="text-gray-500 text-sm">Orders placed for your crops.</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-700">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Volume</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.totalVolume.toLocaleString()} kg</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Processing</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, crops, or buyers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] outline-none text-sm text-gray-800 font-medium transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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

            {/* No Results */}
            {farmerInitialized && farmerOrders.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No orders found</p>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Orders Grid */}
            {farmerInitialized && filtered.length > 0 && (
              <>
                <p className="text-xs text-gray-400 font-medium mb-4">
                  {filtered.length === farmerOrders.length 
                    ? `${farmerOrders.length} orders` 
                    : `${filtered.length} of ${farmerOrders.length} orders`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((order) => (
                    <FarmerOrderCard key={order.crop_order_id} order={order} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default FarmerOrders