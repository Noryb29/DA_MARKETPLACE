import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import { Search, Loader2, Sprout } from 'lucide-react'
import { X } from 'lucide-react'

const FarmsPage = () => {
  const { farms, initialized, getAllFarms } = useMarketStore()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getAllFarms()
  }, [getAllFarms])

  const filtered = useMemo(() => {
    return farms.filter((farm) => {
      const matchSearch =
        !search ||
        farm.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        farm.gps_coordinates?.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [farms, search])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Page Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sprout className="w-3.5 h-3.5" />
                Farm Directory
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Farms</h1>
              <p className="text-gray-500 mt-1 text-sm">Registered farmers and their agricultural operations.</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by farm name or location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]
                    outline-none text-sm text-gray-800 font-medium transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-3">
                {filtered.length === farms.length
                  ? `${farms.length} farms`
                  : `${filtered.length} of ${farms.length} farms`}
              </p>
            )}

            {/* Loading */}
            {!initialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {/* Empty state */}
            {initialized && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Sprout className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No farms found</p>
                <p className="text-xs text-gray-400">Try adjusting your search.</p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-1 text-xs text-green-600 font-semibold hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Farms Grid */}
            {initialized && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((farm) => (
                  <FarmCard key={farm.farm_id} farm={farm} onViewClick={() => navigate(`/shop/farm/${farm.farm_id}`)} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

const FarmCard = ({ farm, onViewClick }) => {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-green-400 p-5 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">{farm.farm_name}</h2>
        <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
          Active
        </span>
      </div>

      <div className="space-y-2">
        {farm.farm_area && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Area</span>
            <span className="font-medium text-gray-900">{parseFloat(farm.farm_area).toFixed(2)} ha</span>
          </div>
        )}

        {farm.gps_coordinates && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Location</span>
            <span className="font-medium text-gray-900">{farm.gps_coordinates}</span>
          </div>
        )}

        {farm.farm_elevation && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Elevation</span>
            <span className="font-medium text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)} m</span>
          </div>
        )}

        <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-900">{new Date(farm.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <button
        onClick={onViewClick}
        className="w-full mt-4 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all text-sm"
      >
        View Farm
      </button>
    </div>
  )
}

export default FarmsPage