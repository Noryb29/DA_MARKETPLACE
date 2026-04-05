import React, { useEffect, useState } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import { useAdminStore } from '../../store/AdminStore'
import { Search, MapPin, Crop, User, Calendar, ChevronDown, X, AlertCircle } from 'lucide-react'

const AdminFarms = () => {
  const { farms, loading, error, getAllFarms, clearError } = useAdminStore()
  const [filteredFarms, setFilteredFarms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [sortField, setSortField] = useState('farm_id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    getAllFarms()
  }, [getAllFarms])

  // Search and filter logic
  useEffect(() => {
    let filtered = farms.filter(farm => {
      const searchLower = searchTerm.toLowerCase()
      return (
        farm.farm_name?.toLowerCase().includes(searchLower) ||
        farm.firstname?.toLowerCase().includes(searchLower) ||
        farm.lastname?.toLowerCase().includes(searchLower) ||
        farm.email?.toLowerCase().includes(searchLower)
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

    setFilteredFarms(filtered)
    setCurrentPage(1)
  }, [searchTerm, farms, sortField, sortOrder])

  // Pagination
  const paginatedFarms = filteredFarms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredFarms.length / itemsPerPage)

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Farms Management</h1>
              <p className="text-gray-600">View and manage all registered farms</p>
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
                    placeholder="Search farms by name, farmer, email..."
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
                    <option value="farm_id">Sort by ID</option>
                    <option value="farm_name">Sort by Name</option>
                    <option value="farm_area">Sort by Area</option>
                    <option value="created_at">Sort by Date</option>
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
                <p className="text-gray-600 text-sm">Total Farms</p>
                <p className="text-2xl font-bold text-gray-900">{farms.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Crops</p>
                <p className="text-2xl font-bold text-gray-900">
                  {farms.reduce((sum, f) => sum + (f.total_crops || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Total Area</p>
                <p className="text-2xl font-bold text-gray-900">
                  {farms.reduce((sum, f) => sum + (f.farm_area || 0), 0)} ha
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600 text-sm">Avg. Elevation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {farms.length > 0 ? Math.round(farms.reduce((sum, f) => sum + (f.farm_elevation || 0), 0) / farms.length) : 0} m
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
                  <p className="mt-4 text-gray-600">Loading farms...</p>
                </div>
              ) : paginatedFarms.length > 0 ? (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farm Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Farmer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Area (ha)</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Elevation (m)</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crops</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFarms.map((farm) => (
                        <tr key={farm.farm_id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-900">{farm.farm_id}</td>
                          <td className="px-6 py-4 text-sm">
                            <p className="font-medium text-gray-900">{farm.farm_name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {farm.firstname} {farm.lastname}
                              </p>
                              <p className="text-xs text-gray-500">{farm.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{farm.farm_area}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{farm.farm_elevation}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {farm.total_crops}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(farm.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedFarm(farm)
                                setShowDetailModal(true)
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} • {filteredFarms.length} results
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
                  <p className="text-gray-600">No farms found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedFarm.farm_name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Farmer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Farmer Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedFarm.firstname} {selectedFarm.lastname}</span></p>
                  <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedFarm.email}</span></p>
                  <p><span className="text-gray-600">Contact:</span> <span className="font-medium">{selectedFarm.contact_number}</span></p>
                </div>
              </div>

              {/* Farm Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Farm Details</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p><span className="text-gray-600">Farm ID:</span> <span className="font-medium">{selectedFarm.farm_id}</span></p>
                  <p><span className="text-gray-600">GPS Coordinates:</span> <span className="font-medium font-mono">{selectedFarm.gps_coordinates}</span></p>
                  <p><span className="text-gray-600">Farm Area:</span> <span className="font-medium">{selectedFarm.farm_area} hectares</span></p>
                  <p><span className="text-gray-600">Elevation:</span> <span className="font-medium">{selectedFarm.farm_elevation} meters</span></p>
                </div>
              </div>

              {/* Crops Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Crop size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Crops ({selectedFarm.total_crops})</h3>
                </div>
                <p className="text-sm text-gray-600">
                  This farm is currently growing {selectedFarm.total_crops} different crop(s).
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Created:</span> <span className="font-medium">{new Date(selectedFarm.created_at).toLocaleString()}</span></p>
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

export default AdminFarms