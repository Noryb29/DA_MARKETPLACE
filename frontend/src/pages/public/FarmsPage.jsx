import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import { Search, Loader2, Sprout, Leaf, MapPin, Ruler, X, ChevronRight, Calendar } from 'lucide-react'

const FarmsPage = () => {
  const { farms, initialized, getAllFarms } = useMarketStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const navigate = useNavigate()

  useEffect(() => {
    getAllFarms()
  }, [getAllFarms])

  const filtered = useMemo(() => {
    let result = farms.filter((farm) => {
      const matchSearch =
        !search ||
        farm.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        farm.gps_coordinates?.toLowerCase().includes(search.toLowerCase()) ||
        `${farm.firstname} ${farm.lastname}`.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })

    // Sort results
    if (sortBy === 'name') {
      result.sort((a, b) => a.farm_name.localeCompare(b.farm_name))
    } else if (sortBy === 'area') {
      result.sort((a, b) => (b.farm_area || 0) - (a.farm_area || 0))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return result
  }, [farms, search, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Page Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-4">
                <Sprout className="w-4 h-4" />
                FARM DIRECTORY
              </div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Explore Local Farms
              </h1>
              <p className="text-gray-600 text-lg">
                Discover {farms.length} registered farms growing fresh produce in Northern Mindanao
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search farm name, location, or farmer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-900 font-medium transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-900 font-medium transition-all"
                  >
                    <option value="name">Farm Name (A-Z)</option>
                    <option value="area">Largest Area</option>
                    <option value="newest">Recently Added</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-green-700 text-lg">{filtered.length}</span>
                      <br />
                      {filtered.length === 1 ? 'Farm' : 'Farms'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {!initialized && (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <p className="text-gray-600 font-medium">Loading farms...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {initialized && filtered.length === 0 && (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Leaf className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Farms Found</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {search ? 'Try adjusting your search criteria.' : 'No farms available at the moment.'}
                </p>
                {search && (
                  <button
                    onClick={() => {
                      setSearch('')
                      setSortBy('name')
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Farms Grid */}
            {initialized && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((farm, idx) => (
                  <FarmCard
                    key={farm.farm_id}
                    farm={farm}
                    onViewClick={() => navigate(`/shop/farm/${farm.farm_id}`)}
                    index={idx}
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

const FarmCard = ({ farm, onViewClick, index }) => {
  return (
    <div
      className="bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl p-6 transition-all transform hover:-translate-y-1 group cursor-pointer"
      onClick={onViewClick}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Farm Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 mb-1">
            {farm.farm_name}
          </h2>
          <p className="text-sm text-gray-600">
            by {farm.firstname} {farm.lastname}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
          Active
        </span>
      </div>

      {/* Farm Info Grid */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        {farm.farm_area && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Ruler className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-semibold">Area</p>
              <p className="text-sm font-bold text-gray-900">{parseFloat(farm.farm_area).toFixed(2)} hectares</p>
            </div>
          </div>
        )}

        {farm.gps_coordinates && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-semibold">Location</p>
              <p className="text-sm font-bold text-gray-900 truncate">{farm.gps_coordinates}</p>
            </div>
          </div>
        )}

        {farm.farm_elevation && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Leaf className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-semibold">Elevation</p>
              <p className="text-sm font-bold text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)} m</p>
            </div>
          </div>
        )}

        {farm.created_at && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-semibold">Registered</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(farm.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* View Button */}
      <button
        onClick={onViewClick}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group"
      >
        View Farm
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

export default FarmsPage