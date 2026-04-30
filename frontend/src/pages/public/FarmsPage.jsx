import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import { Search, Loader2, Sprout, Leaf, MapPin, Ruler, X, ChevronRight, Calendar, SlidersHorizontal, User, FileText, MapPinned } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmsPage = () => {
  const { farms, initialized, getAllFarms } = useMarketStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [filterArea, setFilterArea] = useState('')
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
        farm.farm_location?.toLowerCase().includes(search.toLowerCase()) ||
        `${farm.firstname} ${farm.lastname}`.toLowerCase().includes(search.toLowerCase())

      const matchArea = (() => {
        if (!filterArea) return true
        const area = parseFloat(farm.farm_area) || 0
        if (filterArea === 'small') return area < 5
        if (filterArea === 'medium') return area >= 5 && area < 20
        if (filterArea === 'large') return area >= 20
        return true
      })()

      return matchSearch && matchArea
    })

    if (sortBy === 'name') {
      result.sort((a, b) => a.farm_name.localeCompare(b.farm_name))
    } else if (sortBy === 'area') {
      result.sort((a, b) => (b.farm_area || 0) - (a.farm_area || 0))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return result
  }, [farms, search, sortBy, filterArea])

  const activeFilterCount = [filterArea].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setSortBy('name')
    setFilterArea('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Page Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sprout className="w-3.5 h-3.5" />
                Farm Directory
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Explore Local Farms
              </h1>
              <p className="text-gray-500 text-sm">
                Discover {farms.length} registered farms growing fresh produce
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search farm, location, or farmer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 bg-white
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]
                      outline-none text-sm text-gray-800 font-medium transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all shrink-0
                    ${showFilters || activeFilterCount > 0
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="area">Largest Area</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Area:</span>
                    <button
                      onClick={() => setFilterArea('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterArea ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterArea('small')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'small' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Small (Under 5ha)
                    </button>
                    <button
                      onClick={() => setFilterArea('medium')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'medium' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Medium (5-20ha)
                    </button>
                    <button
                      onClick={() => setFilterArea('large')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'large' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Large (20ha+)
                    </button>
                    
                    {(search || filterArea) && (
                      <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results Info */}
            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-4">
                {filtered.length === farms.length
                  ? `${farms.length} farms`
                  : `${filtered.length} of ${farms.length} farms`}
              </p>
            )}

            {/* Loading State */}
            {!initialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {/* Empty State */}
            {initialized && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Leaf className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No farms found</p>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
                {(search || filterArea) && (
                  <button onClick={clearFilters} className="mt-2 text-xs text-green-600 font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Farms Grid */}
            {initialized && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  const landUseColors = {
    pasture: 'bg-amber-100 text-amber-700',
    cultivated: 'bg-green-100 text-green-700',
    fallow: 'bg-gray-100 text-gray-700'
  }

  const getDocsCount = () => {
    if (!farm.farm_docs) return 0
    if (Array.isArray(farm.farm_docs)) return farm.farm_docs.length
    if (typeof farm.farm_docs === 'string' && farm.farm_docs.startsWith('[')) {
      try {
        return JSON.parse(farm.farm_docs).length
      } catch (e) {
        return 0
      }
    }
    return 0
  }

  const docsCount = getDocsCount()

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onViewClick}
    >
      {/* Farm Image */}
      <div className="h-32 bg-gradient-to-br from-green-400 to-emerald-600 relative">
        {farm.farm_image ? (
          <img src={farm.farm_image.startsWith('http') ? farm.farm_image : `${BASE_URL}${farm.farm_image}`} alt={farm.farm_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sprout className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {farm.land_use_type && (
            <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${landUseColors[farm.land_use_type] || 'bg-gray-100 text-gray-600'}`}>
              {farm.land_use_type}
            </span>
          )}
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-semibold rounded-full">
            Active
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Farm Name & Farmer */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{farm.farm_name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{farm.firstname} {farm.lastname}</span>
          </div>
        </div>

        {/* Farm Details */}
        <div className="space-y-2">
          {farm.farm_location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 truncate">{farm.farm_location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 flex-wrap">
            {farm.farm_area && (
              <div className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-green-700">{parseFloat(farm.farm_area).toFixed(1)} ha</span>
              </div>
            )}
            {farm.total_acres && (
              <div className="flex items-center gap-1">
                <MapPinned className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">{farm.total_acres} acres</span>
              </div>
            )}
            {farm.farm_elevation && (
              <div className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">{parseFloat(farm.farm_elevation).toFixed(0)}m</span>
              </div>
            )}
            {docsCount > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-medium text-purple-700">{docsCount} docs</span>
              </div>
            )}
          </div>

          {farm.created_at && (
            <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-400">
                Since {new Date(farm.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* View Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewClick() }}
          className="w-full mt-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          View Farm
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default FarmsPage