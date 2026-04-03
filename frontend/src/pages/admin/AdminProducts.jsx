import React, { useEffect, useState } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import { useAdminStore } from '../../store/AdminStore'
import { Search, ChevronDown, X, Calendar, Sprout, Package } from 'lucide-react'

const AdminProducts = () => {
  const { products, loading, error, getAllProducts, clearError } = useAdminStore()
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
  }, [])

  // Search and filter logic
  useEffect(() => {
    let filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase()
      return (
        product.crop_name?.toLowerCase().includes(searchLower) ||
        product.variety?.toLowerCase().includes(searchLower) ||
        product.farm_name?.toLowerCase().includes(searchLower) ||
        product.firstname?.toLowerCase().includes(searchLower) ||
        product.lastname?.toLowerCase().includes(searchLower)
      )
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
  }, [searchTerm, products, sortField, sortOrder])

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
                <span className="text-red-800">{error}</span>
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
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + (p.volume || 0), 0).toFixed(1)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">
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
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crop Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Variety</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farm</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Volume</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Harvest Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, idx) => {
                          const stockStatus = getStockStatus(product.stock)
                          return (
                            <tr key={product.crop_id} className="border-b hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm text-gray-900">{product.crop_id}</td>
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
                              <td className="px-6 py-4 text-sm text-gray-600">{product.volume}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                  stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {product.stock} {stockStatus.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(product.expected_harvest).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product)
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
                      Page {currentPage} of {totalPages} • {filteredProducts.length} results
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
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedProduct.crop_name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sprout size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Crop Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Crop Name:</span> <span className="font-medium">{selectedProduct.crop_name}</span></p>
                  <p><span className="text-gray-600">Variety:</span> <span className="font-medium">{selectedProduct.variety}</span></p>
                  <p><span className="text-gray-600">Farm:</span> <span className="font-medium">{selectedProduct.farm_name}</span></p>
                  <p><span className="text-gray-600">Farmer:</span> <span className="font-medium">{selectedProduct.firstname} {selectedProduct.lastname}</span></p>
                </div>
              </div>

              {/* Stock & Volume */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Inventory</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p><span className="text-gray-600">Volume:</span> <span className="font-medium">{selectedProduct.volume} units</span></p>
                  <p><span className="text-gray-600">Stock:</span> 
                    <span className={`ml-2 font-medium ${selectedProduct.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedProduct.stock}
                    </span>
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Planting Date:</span> <span className="font-medium">{new Date(selectedProduct.planting_date).toLocaleDateString()}</span></p>
                  <p><span className="text-gray-600">Expected Harvest:</span> <span className="font-medium">{new Date(selectedProduct.expected_harvest).toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Specifications */}
              {(selectedProduct.specification_1 || selectedProduct.specification_2 || selectedProduct.specification_3 || selectedProduct.specification_4 || selectedProduct.specification_5) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="space-y-2 text-sm">
                    {selectedProduct.specification_1 && <p><span className="text-gray-600">•</span> {selectedProduct.specification_1}</p>}
                    {selectedProduct.specification_2 && <p><span className="text-gray-600">•</span> {selectedProduct.specification_2}</p>}
                    {selectedProduct.specification_3 && <p><span className="text-gray-600">•</span> {selectedProduct.specification_3}</p>}
                    {selectedProduct.specification_4 && <p><span className="text-gray-600">•</span> {selectedProduct.specification_4}</p>}
                    {selectedProduct.specification_5 && <p><span className="text-gray-600">•</span> {selectedProduct.specification_5}</p>}
                  </div>
                </div>
              )}

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

export default AdminProducts