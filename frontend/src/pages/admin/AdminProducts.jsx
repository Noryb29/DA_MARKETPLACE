import React, { useEffect, useState } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import ProductDetailModal from './components/ProductDetailModal'
import { useAdminStore } from '../../store/AdminStore'
import { Search, ChevronDown, X, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const AdminProducts = () => {
  const { products, loading, error, getAllProducts, verifyProduct, clearError } = useAdminStore()
  const [filter, setFilter] = useState('pending')
  const [verifyingId, setVerifyingId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectProductId, setRejectProductId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleVerify = async (productId, is_verified, reason = null) => {
    setVerifyingId(productId)
    try {
      await verifyProduct(productId, is_verified, reason)
      setShowRejectModal(false)
      setRejectProductId(null)
      setRejectionReason('')
    } catch (err) {
      console.error(err)
    } finally {
      setVerifyingId(null)
    }
  }

  const openRejectModal = (productId) => {
    setRejectProductId(productId)
    setRejectionReason('')
    setShowRejectModal(true)
  }
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [sortField, setSortField] = useState('crop_id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    getAllProducts()
  }, [getAllProducts])

  // Search and filter logic
  useEffect(() => {
    let filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        product.crop_name?.toLowerCase().includes(searchLower) ||
        product.variety?.toLowerCase().includes(searchLower) ||
        product.farm_name?.toLowerCase().includes(searchLower) ||
        product.firstname?.toLowerCase().includes(searchLower) ||
        product.lastname?.toLowerCase().includes(searchLower)
      )
      
      if (filter === 'all') return matchesSearch
      if (filter === 'pending') return matchesSearch && !product.is_verified && !product.rejection_reason
      if (filter === 'approved') return matchesSearch && product.is_verified
      if (filter === 'rejected') return matchesSearch && !product.is_verified && product.rejection_reason
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

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchTerm, products, sortField, sortOrder, filter])

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', label: 'Out of Stock' }
    if (stock < 10) return { color: 'yellow', label: 'Low Stock' }
    return { color: 'green', label: 'In Stock' }
  }

  const handleOpenModal = (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedProduct(null)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
              <p className="text-gray-600">View all crops and product listings</p>
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
                    placeholder="Search crops by name, variety, farm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="flex gap-2">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="crop_id">Sort by ID</option>
                    <option value="crop_name">Sort by Name</option>
                    <option value="stock">Sort by Stock</option>
                    <option value="expected_harvest">Sort by Harvest Date</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-medium">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {products.reduce((sum, p) => sum + (p.volume || 0), 0).toFixed(1)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-medium">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {products.filter(p => (p.stock || 0) < 10).length}
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
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : paginatedProducts.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crop Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Variety</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farm</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Volume</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Harvest Date</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product) => {
                          const stockStatus = getStockStatus(product.stock)
                          return (
                            <tr key={product.crop_id} className="border-b hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.crop_id}</td>
                              <td className="px-6 py-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">{product.crop_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {product.firstname} {product.lastname}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{product.variety}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {product.farm_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.volume}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                  stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(product.expected_harvest).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                {product.is_verified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <CheckCircle size={12} /> Approved
                                  </span>
                                ) : product.rejection_reason ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    <XCircle size={12} /> Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                    <AlertCircle size={12} /> Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {(!product.is_verified && !product.rejection_reason) && (
                                    <>
                                      <button
                                        onClick={() => handleVerify(product.crop_id, true)}
                                        disabled={verifyingId === product.crop_id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs font-medium"
                                      >
                                        {verifyingId === product.crop_id ? (
                                          <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                          <CheckCircle size={12} />
                                        )}
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => openRejectModal(product.crop_id)}
                                        disabled={verifyingId === product.crop_id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs font-medium"
                                      >
                                        <XCircle size={12} />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {product.rejection_reason && (
                                    <button
                                      onClick={() => handleVerify(product.crop_id, true)}
                                      disabled={verifyingId === product.crop_id}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs font-medium"
                                    >
                                      <CheckCircle size={12} />
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenModal(product)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                                  >
                                    View Details
                                  </button>
                                </div>
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
                      Page {currentPage} of {totalPages} • {filteredProducts.length} results
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Previous
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showDetailModal}
        product={selectedProduct}
        onClose={handleCloseModal}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Product</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this product. This will be shown to the farmer.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectProductId, false, rejectionReason)}
                disabled={!rejectionReason.trim() || verifyingId === rejectProductId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingId === rejectProductId ? 'Rejecting...' : 'Reject Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts