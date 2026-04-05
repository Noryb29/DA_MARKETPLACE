import React, { useEffect, useState } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import { useAdminStore } from '../../store/AdminStore'
import { Search, ChevronDown, X, Truck, User, Calendar, AlertCircle,Package } from 'lucide-react'

const AdminOrders = () => {
  const { orders, loading, error, getAllOrders, clearError } = useAdminStore()
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [sortField, setSortField] = useState('crop_order_id')
  const [sortOrder, setSortOrder] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    getAllOrders()
  }, [getAllOrders])

  // Search and filter logic
  useEffect(() => {
    let filtered = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        order.crop_name?.toLowerCase().includes(searchLower) ||
        order.buyer_firstname?.toLowerCase().includes(searchLower) ||
        order.buyer_lastname?.toLowerCase().includes(searchLower) ||
        order.farmer_firstname?.toLowerCase().includes(searchLower) ||
        order.farmer_lastname?.toLowerCase().includes(searchLower) ||
        order.buyer_email?.toLowerCase().includes(searchLower) ||
        order.crop_order_id?.toString().includes(searchLower)
      )

      return matchesSearch
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [searchTerm, orders, sortField, sortOrder, statusFilter])

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const getOrderStatus = (orderDate, expectedArrival) => {
    const today = new Date()
    const arrival = new Date(expectedArrival)
    
    if (arrival < today) {
      return { status: 'Delivered', color: 'green' }
    }
    return { status: 'Pending', color: 'blue' }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
              <p className="text-gray-600">Track and manage all crop orders</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by order ID, crop, buyer, farmer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="crop_order_id">Sort by Order ID</option>
                    <option value="order_date">Sort by Date</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="expected_arrival">Sort by Arrival</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ChevronDown size={20} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => new Date(o.expected_arrival) >= new Date()).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, o) => sum + (o.quantity || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, o) => sum + (o.volume || 0), 0)}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : paginatedOrders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crop</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Buyer</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farmer</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expected Arrival</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order) => {
                          const orderStatus = getOrderStatus(order.order_date, order.expected_arrival)
                          return (
                            <tr key={order.crop_order_id} className="border-b hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{order.crop_order_id}</td>
                              <td className="px-6 py-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">{order.crop_name}</p>
                                  <p className="text-xs text-gray-500">{order.variety}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {order.buyer_firstname} {order.buyer_lastname}
                                  </p>
                                  <p className="text-xs text-gray-500">{order.buyer_email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <p className="font-medium text-gray-900">
                                  {order.farmer_firstname} {order.farmer_lastname}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {order.quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(order.order_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(order.expected_arrival).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  orderStatus.color === 'green' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {orderStatus.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowDetailModal(true)
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} • {filteredOrders.length} results
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.crop_order_id}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">Order Status</p>
                <p className="text-2xl font-bold text-blue-900">
                  {getOrderStatus(selectedOrder.order_date, selectedOrder.expected_arrival).status}
                </p>
              </div>

              {/* Crop Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Crop Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Crop Name:</span> <span className="font-medium">{selectedOrder.crop_name}</span></p>
                  <p><span className="text-gray-600">Variety:</span> <span className="font-medium">{selectedOrder.variety}</span></p>
                  <p><span className="text-gray-600">Farm:</span> <span className="font-medium">{selectedOrder.farm_name}</span></p>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Buyer Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedOrder.buyer_firstname} {selectedOrder.buyer_lastname}</span></p>
                  <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedOrder.buyer_email}</span></p>
                  <p><span className="text-gray-600">Contact:</span> <span className="font-medium">{selectedOrder.buyer_contact}</span></p>
                  <p><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedOrder.buyer_address}</span></p>
                </div>
              </div>

              {/* Farmer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Farmer Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedOrder.farmer_firstname} {selectedOrder.farmer_lastname}</span></p>
                  <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedOrder.farmer_email}</span></p>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Order Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{selectedOrder.quantity}</span></p>
                  <p><span className="text-gray-600">Volume:</span> <span className="font-medium">{selectedOrder.volume}</span></p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Order Date:</span> <span className="font-medium">{new Date(selectedOrder.order_date).toLocaleString()}</span></p>
                  <p><span className="text-gray-600">Expected Arrival:</span> <span className="font-medium">{new Date(selectedOrder.expected_arrival).toLocaleString()}</span></p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders